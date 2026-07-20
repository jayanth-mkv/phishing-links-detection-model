# Phishy browser prototype

This unpacked Manifest V3 extension can send the active HTTP(S) URL to a locally running copy of the research API. It is disabled by default and no longer sends browsing data to a hosted third-party endpoint.

After loading the extension unpacked, opt in from the extension service-worker console:

```js
chrome.storage.sync.set({ apiBaseUrl: "http://127.0.0.1:5000" })
```

Clear the setting to stop automatic checks:

```js
chrome.storage.sync.remove("apiBaseUrl")
```

Scoring results are cached only in `chrome.storage.session`; visited URLs are not synced. Feedback submission is intentionally disabled because a trusted feedback API key cannot be kept secret in a public extension.

The model result is a heuristic signal, not a browser security guarantee. Keep normal Safe Browsing, endpoint protection, and user judgment enabled.
