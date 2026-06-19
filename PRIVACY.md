# Privacy Policy — VC Tabs

**Effective date:** 19 June 2026

VC Tabs ("the extension") is a tab manager that lets you save, organize, and
restore browser tabs into Spaces and Collections. It works fully offline, and
offers an **optional** account so your data can sync across devices. This policy
explains exactly what is collected, where it goes, and why.

## Summary

- **Local-first.** Without signing in, everything you create stays on your
  device in `chrome.storage.local`. The only outbound request in that mode is to
  load website **favicons** (see below).
- **Optional sync.** If you choose to create an account and sign in, your saved
  tabs and collections are sent to and stored on our server so they follow you
  across devices. Sign-in is entirely optional and off by default.
- We do **not** sell or rent your data, show ads, or run third-party analytics.

## What is stored on your device

Stored **locally** via `chrome.storage.local` (and, when signed in, also synced —
see below):

- The Spaces, Collections, and saved tabs you create — their **titles, URLs, and
  optional descriptions**.
- Your interface preferences (theme, view mode, sort order, active space).
- When signed in: your account email and **sign-in tokens** (so you stay logged
  in). Tokens are held locally by the extension and sent only to our API.

You can remove local data at any time by deleting items in the extension, or by
removing the extension from `chrome://extensions` (which clears its storage).

## Optional account & cloud sync — what is sent to our server

This section applies **only if you create an account and sign in.** If you never
sign in, none of the following happens.

- **Account credentials.** Your **email address** and a **password**. The
  password is sent over HTTPS and stored only as a salted **argon2id hash** — we
  never store or log your plaintext password.
- **Your content.** The Spaces, Collections, and saved tabs you sync — their
  **titles, URLs, and descriptions** — are transmitted to and stored on our
  server so they can sync to your other signed-in devices.
- **Transactional email.** We send you email to **verify your address** and to
  **reset your password**. We do not send marketing email.
- **Security signals.** We process your IP address transiently to rate-limit
  abuse of the sign-in and password endpoints.

You can stop syncing at any time by signing out. To delete your account and the
data stored on our server, contact us at the address below.

## Service providers (subprocessors)

When sync is used, your data is processed by the following providers acting on
our behalf — not for their own purposes, and never sold:

- **MongoDB Atlas** — hosts the synced database (your account and collections).
- **Resend** — sends the verification and password-reset emails.
- **Upstash** — rate-limiting to protect the auth endpoints.
- **Vercel** — hosts the sync API.

## Browser permissions and why they are used

- **`tabs`** — to read the **titles and URLs of your open tabs** so you can save
  and restore them. Read only when you act (e.g. saving a tab or a session).
- **`storage`** — to save your spaces, collections, preferences, and (when signed
  in) your session on your device.
- **`alarms`** — to schedule a lightweight periodic background timer used to keep
  your sign-in **session token fresh** while you are signed in to sync. It
  transmits nothing when you are signed out.

## Favicons (third-party request)

To show a website's icon next to a saved or open tab, the extension loads
favicons from Google's public favicon service
(`https://www.google.com/s2/favicons`). That request includes the **domain name**
(e.g. `example.com`) of the site whose icon is shown — no other information.
Google's handling of that request is governed by Google's own privacy policy.

## Data sharing and sale

We do **not** sell, rent, or share your data with anyone for their own purposes.
The extension contains no advertising or third-party analytics. Data is shared
only with the service providers listed above, solely to operate sync.

## Data retention and deletion

- **Local data** is removed when you delete items or uninstall the extension.
- **Synced data** persists on our server until you delete it or request account
  deletion. Email us to delete your account and associated server data.

## Children's privacy

The extension is not directed to children under 13 and does not knowingly collect
personal information from them.

## Changes to this policy

If this policy changes, the "Effective date" above will be updated and the new
version will be published at the same public URL.

## Contact

Questions or deletion requests: **vietnguyen148@gmail.com**
