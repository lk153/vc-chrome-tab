I need to build a tab management as Chrome extension same exactly like 'Toby: Tab Management Tool' (refer installation link https://chromewebstore.google.com/detail/toby-tab-management-tool/hddnkoipeenegfoeaoibdmnaalmgkpip?hl=en)

# Feature Requirements

- ☁️ Cloud Sync — Your collections follow you across devices and browsers. Save a session on your laptop, open it on your desktop. No exports, no manual backups.

- ⚡ Session Save & Restore — Close your entire browser and reopen everything with one click. No more "don't close this window" anxiety — and no more losing track of previously opened tabs.

- 📁 Collections & Spaces — Organize tabs into projects, topics, and areas. Your whole digital world, visible at a glance on every new tab. Switch between work contexts easily.

- ✋ Drag & Drop — Move tabs between collections with a click and drag. Organize on the fly without breaking your flow.

- 🔍 Instant Search — Find any saved tab across all your collections in seconds. No more re-Googling things you already found, no more digging through browser history for that doc you had open last week.

- 🔗 Links — Type to/docs or to/standup in your browser and jump straight there. No bookmarks, no digging.

- ✅ Next — Turn tabs into a prioritized to-do list. Work through your day without losing your place.

- 📝 Notes — A personal notepad built into your workspace. Capture ideas without leaving Toby.

- 📌 Quick Access — Pin Toby to your toolbar and save or open collections from any window, any time.

- 🎨 Light/Dark mode & Themes — Pick the look that fits how you work. Light, dark, or somewhere in between.

# Technical Requirement
- You are a Principal Full-Stack Software Engineer
- Due to the intention to deploy on **Vercel** (https://vercel.com). So propose a tech stack that is easy to set up on Vercel and deploy on it
- DB storage [**IF NEED**]: MongoDB (Atlas). The connection string is **not stored here** — it lives only in a
  gitignored `apps/web/.env.local` as the `MONGODB_URI` env var, never committed. (The original demo string used weak
  credentials and was treated as compromised; rotate the DB password in Atlas. See `apps/web/.env.example`.)
- Code should be organized as prioritizing on readable, maintainable
- Split into small function if need, DO NOT write long function/method