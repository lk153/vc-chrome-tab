import type { ReactNode } from "react";

// Public privacy policy. Mirrors the repo PRIVACY.md and is linked from the
// Chrome Web Store listing. Plain server component — no client JS.
export const metadata = {
  title: "Privacy Policy · VC Tabs",
  description: "How VC Tabs handles your data: local-first, with optional account-based sync.",
};

const TEXT = "#1a1c19";
const MUTED = "#43483e";
const BRAND = "#147a4a";

function H2({ children }: { children: ReactNode }) {
  return <h2 style={{ fontSize: 19, fontWeight: 700, margin: "32px 0 10px" }}>{children}</h2>;
}
function P({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 15, lineHeight: 1.7, color: MUTED, margin: "0 0 12px" }}>{children}</p>;
}
function LI({ children }: { children: ReactNode }) {
  return <li style={{ fontSize: 15, lineHeight: 1.7, color: MUTED, margin: "0 0 8px" }}>{children}</li>;
}

export default function PrivacyPage() {
  return (
    <main
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "48px 24px 80px",
        fontFamily: "'Hanken Grotesk', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        color: TEXT,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 800, color: BRAND, marginBottom: 28 }}>VC Tabs</div>
      <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 8px" }}>Privacy Policy</h1>
      <p style={{ fontSize: 14, color: "#74796d", margin: "0 0 8px" }}>Effective date: 22 June 2026</p>
      <P>
        VC Tabs (&ldquo;the extension&rdquo;) is a tab manager that lets you save, organize, and restore
        browser tabs into Spaces and Collections. It works fully offline, and offers an{" "}
        <strong>optional</strong> account so your data can sync across devices. This policy explains
        exactly what is collected, where it goes, and why.
      </P>

      <H2>Summary</H2>
      <ul>
        <LI>
          <strong>Local-first.</strong> Without signing in, everything you create stays on your device
          in <code>chrome.storage.local</code>. The only request that leaves your device in that mode is
          a favicon lookup to Google (see &ldquo;Favicons&rdquo;).
        </LI>
        <LI>
          <strong>Optional sync.</strong> If you create an account and sign in, your Spaces, Collections,
          and saved tabs are sent to and stored on our server so they sync across your devices. Sign-in
          is optional and off by default.
        </LI>
        <LI>We do not sell or rent your data, show ads, or run any analytics or tracking.</LI>
      </ul>

      <H2>What is stored on your device</H2>
      <P>Stored locally via <code>chrome.storage.local</code>:</P>
      <ul>
        <LI>
          Your Spaces, Collections, and saved tabs — their names, titles, full URLs, descriptions,
          favicon URLs, star flags, ordering, and collapse state.
        </LI>
        <LI>Your interface preferences (theme, view mode, sort order, active space).</LI>
        <LI>
          When signed in: your account email and sign-in tokens (access + refresh), used only to talk to
          our API. These are held in the browser&rsquo;s extension storage (unencrypted); signing out
          removes them.
        </LI>
      </ul>
      <P>
        Reading your open tabs (their titles and URLs) happens only in memory while the extension is
        open, so you can choose which to save — open tabs are never stored or transmitted unless you
        explicitly save them. You can remove local data any time by deleting items, or by removing the
        extension from <code>chrome://extensions</code> (which clears its storage).
      </P>

      <H2>Optional account &amp; cloud sync — what is sent to our server</H2>
      <P>This applies only if you create an account and sign in. If you never sign in, none of this happens.</P>
      <ul>
        <LI>
          <strong>Account credentials.</strong> Your email address and a password. The password is sent
          over HTTPS and stored only as a salted argon2id hash — we never store or log your plaintext password.
        </LI>
        <LI>
          <strong>Your content.</strong> The full structure of what you sync: Space names and emoji
          icons; Collection names, ordering, and collapse state; and your saved tabs&rsquo; titles, full
          URLs, descriptions, favicon URLs, star flags, and ordering — along with parent relationships
          and created/updated timestamps. Stored only to your own account, to sync to your other devices.
        </LI>
        <LI>
          <strong>Device / session info.</strong> Your browser&rsquo;s User-Agent string is recorded with
          each sign-in session, to help manage and revoke sessions.
        </LI>
        <LI>
          <strong>Transactional email.</strong> We email you to verify your address and reset your
          password (via Resend). We do not send marketing email.
        </LI>
        <LI>
          <strong>Abuse prevention.</strong> We use your IP address and email address as keys to
          rate-limit the sign-in and password endpoints. When our rate-limiter (Upstash) is enabled,
          these keys are held only for the limiter&rsquo;s short time window; they are not written to the
          main database.
        </LI>
      </ul>
      <P>
        You can stop syncing any time by signing out. To delete your account and the data stored on our
        server, contact us at the address below — there is currently no in-app &ldquo;delete account&rdquo; button.
      </P>

      <H2>Service providers (subprocessors)</H2>
      <P>When sync is used, your data is processed by these providers on our behalf — never sold:</P>
      <ul>
        <LI><strong>MongoDB Atlas</strong> — hosts the synced database (account, sessions, content).</LI>
        <LI><strong>Resend</strong> — sends verification and password-reset email (receives your email + the link).</LI>
        <LI><strong>Upstash</strong> — rate-limiting (receives your IP and email as short-lived keys; no content, passwords, or tokens).</LI>
        <LI><strong>Vercel</strong> — hosts the API; all traffic transits Vercel.</LI>
      </ul>

      <H2>Browser permissions and why they are used</H2>
      <ul>
        <LI><strong>tabs</strong> — to read the titles and URLs of your open tabs so you can save and restore them, only when you act.</LI>
        <LI><strong>storage</strong> — to save your spaces, collections, preferences, and (when signed in) your session on your device.</LI>
        <LI><strong>Access to <code>vc-chrome-tab-extension.vercel.app</code></strong> (host permission) — to communicate with our sync API for optional sign-in and to back up / restore your collections. Used only when you sign in; no other sites are accessed.</LI>
      </ul>

      <H2>Favicons (third-party request)</H2>
      <P>
        To show a website&rsquo;s icon, the extension loads favicons from Google&rsquo;s public favicon
        service (<code>https://www.google.com/s2/favicons</code>). That request includes only the domain
        name (e.g. <code>example.com</code>) of the page whose icon is shown — no path, no other data.
        This happens whether or not you are signed in. Google&rsquo;s handling is governed by
        Google&rsquo;s own privacy policy.
      </P>

      <H2>Data sharing and sale</H2>
      <P>
        We do not sell, rent, or share your data with anyone for their own purposes. There is no
        advertising or third-party analytics. Data is shared only with the providers above, solely to operate sync.
      </P>
      <P>
        VC Tabs&rsquo; use of information received from Google APIs, and all user data it handles,
        adheres to the{" "}
        <a
          href="https://developer.chrome.com/docs/webstore/program-policies/limited-use"
          style={{ color: BRAND }}
        >
          Chrome Web Store User Data Policy
        </a>
        , including the Limited Use requirements.
      </P>

      <H2>Data retention and deletion</H2>
      <ul>
        <LI>Local data is removed when you delete items or uninstall the extension.</LI>
        <LI>
          Synced data is kept on our server until you ask us to delete it. Items you remove while syncing
          are recorded as tombstones, so deleted content may persist on the server until your account is
          deleted. Sign-in sessions (hashed refresh tokens and their device info) auto-expire about 30
          days after issue.
        </LI>
        <LI>There is no self-service account deletion yet — email us (below) to delete your account and its server-side data.</LI>
      </ul>

      <H2>Children&rsquo;s privacy</H2>
      <P>The extension is not directed to children under 13 and does not knowingly collect personal information from them.</P>

      <H2>Changes to this policy</H2>
      <P>If this policy changes, the effective date above will be updated and the new version published at the same URL.</P>

      <H2>Contact</H2>
      <P>Questions or deletion requests: <a href="mailto:vietnguyen148@gmail.com" style={{ color: BRAND }}>vietnguyen148@gmail.com</a></P>
    </main>
  );
}
