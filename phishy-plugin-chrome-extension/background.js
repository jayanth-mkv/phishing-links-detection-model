import getPercentage from "./scripts/utils.js";

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url?.startsWith("http")) {
    return;
  }

  const cached = await chrome.storage.session.get(tab.url);
  let percentage = cached[tab.url]?.safe;
  if (typeof percentage !== "number") {
    percentage = await getPercentage(tab.url);
    if (percentage >= 0) {
      await chrome.storage.session.set({ [tab.url]: { safe: percentage } });
    }
  }

  if (percentage < 0) {
    return;
  }

  chrome.tabs.sendMessage(tabId, {
    type: percentage >= 0.5 ? "showSafeMessage" : "showErrorMessage",
    message:
      percentage >= 0.5
        ? "The research model rated this URL as lower risk."
        : "Caution: the research model detected phishing indicators.",
    percent: percentage,
  }).catch(() => undefined);
});
