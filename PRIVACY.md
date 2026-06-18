# Privacy Policy — VC Tabs

**Effective date:** 17 June 2026

VC Tabs ("the extension") is a tab manager that lets you save, organize, and
restore browser tabs. This policy explains exactly what the extension does and
does not do with your information.

## Summary

- **Your data stays on your device.** Spaces, collections, saved tabs, and
  preferences are stored locally in your browser via `chrome.storage.local`.
- **We do not run any server, account system, analytics, or ads** in this
  version, and we do **not** sell or share your data.
- The only outbound request is to load website **favicons** (see below).

## What the extension stores

All of the following is stored **locally in your browser** and never sent to us:

- The Spaces, Collections, and saved tabs you create (their titles, URLs, and
  optional descriptions).
- Your interface preferences (theme, view mode, sort order, active space).

You can remove this data at any time by deleting items in the extension, or by
removing the extension from `chrome://extensions` (which clears its storage).

## Browser permissions and why they are used

- **`tabs`** — to read the titles and URLs of your currently open tabs so you can
  save and restore them. This data is only used locally and only when you act.
- **`storage`** — to save your spaces, collections, and preferences on your device.
- **`alarms`** — to schedule lightweight background timers (reserved for a future
  optional sync feature; it transmits nothing today).

## Third-party services

To display a website's icon next to a saved tab, the extension loads favicons
from Google's public favicon service
(`https://www.google.com/s2/favicons`). This request includes the **domain name**
(e.g. `example.com`) of the site whose icon is being shown. No other information
is sent, and Google's handling of that request is governed by Google's own
privacy policy.

## Data sharing and sale

We do **not** sell, rent, or share your data with anyone. The extension contains
no advertising or third-party analytics.

## Future cloud sync (not active yet)

A future version may offer an **optional** account and cloud-sync feature so your
collections follow you across devices. If and when that ships, this policy will be
updated to describe what is transmitted and stored, and sync will remain
opt-in. The current version does not include it.

## Children's privacy

The extension is not directed to children under 13 and does not knowingly collect
personal information from them.

## Changes to this policy

If this policy changes, the "Effective date" above will be updated and the new
version will be published at the same public URL.

## Contact

Questions about this policy: **<add-your-contact-email-here>**
