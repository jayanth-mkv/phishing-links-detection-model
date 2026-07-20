import socket
import unittest
from unittest.mock import patch

from url_security import URLSecurityError, validate_public_url


class URLSecurityTests(unittest.TestCase):
    def test_rejects_non_http_schemes(self):
        with self.assertRaises(URLSecurityError):
            validate_public_url("file:///etc/passwd")

    def test_rejects_credentials(self):
        with self.assertRaises(URLSecurityError):
            validate_public_url("https://user:password@example.com/")

    def test_rejects_private_addresses(self):
        with self.assertRaises(URLSecurityError):
            validate_public_url("http://127.0.0.1/")

    @patch("url_security.socket.getaddrinfo")
    def test_accepts_a_public_https_destination(self, getaddrinfo):
        getaddrinfo.return_value = [
            (socket.AF_INET, socket.SOCK_STREAM, 6, "", ("93.184.216.34", 0)),
        ]
        self.assertEqual(
            validate_public_url("https://example.com/path"),
            "https://example.com/path",
        )


if __name__ == "__main__":
    unittest.main()
