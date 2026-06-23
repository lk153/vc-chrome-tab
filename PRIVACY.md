# Privacy Policy — VC Tabs

**Effective date:** 22 June 2026

VC Tabs ("the extension") is a tab manager that lets you save, organize, and
restore browser tabs into Spaces and Collections. It works fully offline, and
offers an **optional** account so your data can sync across devices. This policy
explains exactly what is collected, where it goes, and why.

## Summary

- **Local-first.** Without signing in, everything you create stays on your
  device in `chrome.storage.local`. The only request that leaves your device in
  that mode is a favicon lookup to Google (see "Favicons").
- **Optional sync.** If you create an account and sign in, your Spaces,
  Collections, and saved tabs are sent to and stored on our server so they sync
  across your devices. Sign-in is optional and off by default.
- We do **not** sell or rent your data, show ads, or run any analytics or
  tracking.

## What is stored on your device

Stored locally via `chrome.storage.local`:

- Your Spaces, Collections, and saved tabs — their names, titles, full URLs,
  descriptions, favicon URLs, star flags, ordering, and collapse state.
- Your interface preferences (theme, view mode, sort order, active space).
- When signed in: your account email and sign-in tokens (access + refresh), used
  only to talk to our API. These are held in the browser's extension storage
  (unencrypted); signing out removes them.

Reading your **open tabs** (their titles and URLs) happens only in memory while
the extension is open, so you can choose which to save — open tabs are never
stored or transmitted unless you explicitly save them.

You can remove local data at any time by deleting items in the extension, or by
removing the extension from `chrome://extensions` (which clears its storage).

## Optional account & cloud sync — what is sent to our server

This applies **only if you create an account and sign in.** If you never sign
in, none of this happens.

- **Account credentials.** Your email address and a password. The password is
  sent over HTTPS and stored only as a salted **argon2id** hash — we never store
  or log your plaintext password.
- **Your content.** The full structure of what you sync: Space names and emoji
  icons; Collection names, ordering, and collapse state; and your saved tabs'
  titles, full URLs, descriptions, favicon URLs, star flags, and ordering —
  along with the parent relationships and created/updated timestamps. This is
  stored on our server so it can sync to your other signed-in devices, and only
  to your own account.
- **Device / session info.** Your browser's User-Agent string is recorded with
  each sign-in session, to help manage and revoke sessions.
- **Transactional email.** We email you to verify your address and to reset your
  password (via Resend). We do not send marketing email.
- **Abuse prevention.** We use your IP address and email address as keys to
  rate-limit the sign-in and password endpoints. When our rate-limiter (Upstash)
  is enabled, these keys are held only for the limiter's short time window; they
  are not written to the main database.

You can stop syncing at any time by signing out. To delete your account and the
data stored on our server, contact us at the address below — there is currently
no in-app "delete account" button.

## Service providers (subprocessors)

When sync is used, your data is processed by these providers on our behalf —
never sold:

- **MongoDB Atlas** — hosts the synced database (your account, sessions, and content).
- **Resend** — sends verification and password-reset email (receives your email
  address and the link).
- **Upstash** — rate-limiting (receives your IP and email as short-lived keys;
  no content, passwords, or tokens).
- **Vercel** — hosts the API; all traffic transits Vercel.

## Browser permissions and why they are used

- **`tabs`** — to read the titles and URLs of your open tabs so you can save and
  restore them. Used only when you act; we don't track browsing in the background.
- **`storage`** — to save your spaces, collections, preferences, and (when signed
  in) your session on your device.
- **Access to `vc-chrome-tab-extension.vercel.app`** (host permission) — to
  communicate with our sync API for optional sign-in and to back up / restore
  your collections. Used only when you sign in; no other sites are accessed.

## Favicons (third-party request)

To show a website's icon next to a tab, the extension loads favicons from
Google's public favicon service (`https://www.google.com/s2/favicons`). That
request includes only the **domain name** (e.g. `example.com`) of the page whose
icon is shown — no path, no other data. This happens whether or not you are
signed in. Google's handling is governed by Google's own privacy policy.

## Data sharing and sale

We do **not** sell, rent, or share your data with anyone for their own purposes.
There is no advertising or third-party analytics. Data is shared only with the
providers above, solely to operate sync.

VC Tabs' use of information received from Google APIs, and all user data it
handles, adheres to the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/limited-use),
including the Limited Use requirements.

## Data retention and deletion

- **Local data** is removed when you delete items or uninstall the extension.
- **Synced data** is kept on our server until you ask us to delete it. Items you
  remove while syncing are recorded as tombstones, so deleted content may persist
  on the server until your account is deleted. Sign-in sessions (hashed refresh
  tokens and their device info) automatically expire about 30 days after issue.
- There is **no self-service account deletion yet** — email us (below) to delete
  your account and its server-side data.

## Children's privacy

The extension is not directed to children under 13 and does not knowingly collect
personal information from them.

## Changes to this policy

If this policy changes, the "Effective date" above will be updated and the new
version published at the same public URL.

## Contact

Questions or deletion requests: **vietnguyen148@gmail.com**
