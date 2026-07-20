"""Validation and bounded fetching for untrusted URL inputs."""

from dataclasses import dataclass
import ipaddress
import socket
from urllib.parse import urljoin, urlsplit

import requests


class URLSecurityError(ValueError):
    """Raised when a URL is unsafe for server-side processing."""


@dataclass
class FetchedPage:
    text: str = ""
    history: tuple = ()


def resolve_public_host(hostname: str) -> set[str]:
    if hostname.lower().rstrip(".") == "localhost":
        raise URLSecurityError("Local hostnames are not allowed")

    try:
        records = socket.getaddrinfo(hostname, None, type=socket.SOCK_STREAM)
    except socket.gaierror as exc:
        raise URLSecurityError("The hostname could not be resolved") from exc

    addresses = {record[4][0].split("%", 1)[0] for record in records}
    if not addresses:
        raise URLSecurityError("The hostname did not resolve to an address")

    for address in addresses:
        try:
            parsed = ipaddress.ip_address(address)
        except ValueError as exc:
            raise URLSecurityError("The hostname resolved to an invalid address") from exc
        if not parsed.is_global:
            raise URLSecurityError("Private or non-routable destinations are not allowed")

    return addresses


def validate_public_url(value: str) -> str:
    if not isinstance(value, str):
        raise URLSecurityError("URL must be a string")
    value = value.strip()
    if not value or len(value) > 2_048:
        raise URLSecurityError("URL must contain between 1 and 2048 characters")

    parsed = urlsplit(value)
    if parsed.scheme not in {"http", "https"}:
        raise URLSecurityError("Only HTTP and HTTPS URLs are allowed")
    if not parsed.hostname or parsed.username or parsed.password:
        raise URLSecurityError("URL credentials and missing hostnames are not allowed")
    try:
        port = parsed.port
    except ValueError as exc:
        raise URLSecurityError("The URL port is invalid") from exc
    if port not in {None, 80, 443}:
        raise URLSecurityError("Only standard HTTP and HTTPS ports are allowed")

    resolve_public_host(parsed.hostname)
    return value


def safe_fetch(value: str, max_redirects: int = 3, max_bytes: int = 1_000_000) -> FetchedPage:
    current = validate_public_url(value)
    redirect_count = 0

    while True:
        response = requests.get(
            current,
            allow_redirects=False,
            headers={"User-Agent": "PhishingFeatureResearch/1.0"},
            stream=True,
            timeout=(3, 5),
        )
        try:
            if response.is_redirect or response.is_permanent_redirect:
                if redirect_count >= max_redirects:
                    raise URLSecurityError("The URL redirected too many times")
                location = response.headers.get("Location")
                if not location:
                    raise URLSecurityError("The redirect did not include a destination")
                current = validate_public_url(urljoin(current, location))
                redirect_count += 1
                continue

            content_type = response.headers.get("Content-Type", "").lower()
            if "text/html" not in content_type and "application/xhtml+xml" not in content_type:
                raise URLSecurityError("The destination did not return HTML")

            chunks = []
            total = 0
            for chunk in response.iter_content(chunk_size=16_384):
                total += len(chunk)
                if total > max_bytes:
                    raise URLSecurityError("The destination response was too large")
                chunks.append(chunk)
            encoding = response.encoding or "utf-8"
            return FetchedPage(
                text=b"".join(chunks).decode(encoding, errors="replace"),
                history=tuple(range(redirect_count)),
            )
        finally:
            response.close()
