const allowedLocalOrigins = new Set([
  "http://127.0.0.1:5000",
  "http://localhost:5000",
]);

export async function getApiBaseUrl() {
  const { apiBaseUrl = "" } = await chrome.storage.sync.get("apiBaseUrl");
  const normalized = apiBaseUrl.replace(/\/$/, "");
  return allowedLocalOrigins.has(normalized) ? normalized : "";
}

export default async function getPercentage(url) {
  const apiBaseUrl = await getApiBaseUrl();
  if (!apiBaseUrl) {
    return -1;
  }

  const formData = new FormData();
  formData.append("url", url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(`${apiBaseUrl}/`, {
      method: "POST",
      body: formData,
      redirect: "error",
      signal: controller.signal,
    });
    if (!response.ok) {
      return -1;
    }
    const data = await response.json();
    return typeof data.prob_not_phishy === "number" ? data.prob_not_phishy : -1;
  } catch {
    return -1;
  } finally {
    clearTimeout(timeout);
  }
}
