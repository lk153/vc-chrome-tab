/**
 * MV3 background service worker.
 *
 * Phase 1 keeps this intentionally light. The worker is ephemeral, so it holds
 * no durable state — everything persists in chrome.storage. The keep-alive
 * alarm is the seam where Phase 2 will perform silent auth-token refresh.
 */

const REFRESH_ALARM = "vctabs:refresh";

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(REFRESH_ALARM, { periodInMinutes: 14 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === REFRESH_ALARM) {
    // Phase 2: refresh the access token here if a session exists.
  }
});

/** Lightweight message bus for the popup / pages (extended in later phases). */
chrome.runtime.onMessage.addListener((message: { type?: string }, _sender, sendResponse) => {
  if (message?.type === "PING") {
    sendResponse({ ok: true });
  }
  return false;
});
