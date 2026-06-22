/**
 * MV3 background service worker.
 *
 * Intentionally light: the worker is ephemeral and holds no durable state —
 * everything persists in chrome.storage, and token refresh happens in the page
 * contexts (reactively on a 401, plus the sync engine's pull timer).
 */

/** Lightweight message bus for the popup / pages (extended in later phases). */
chrome.runtime.onMessage.addListener((message: { type?: string }, _sender, sendResponse) => {
  if (message?.type === "PING") {
    sendResponse({ ok: true });
  }
  return false;
});
