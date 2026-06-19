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
      <p style={{ fontSize: 14, color: "#74796d", margin: "0 0 8px" }}>Effective date: 19 June 2026</p>
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
          in <code>chrome.storage.local</code>. The only outbound request in that mode is to load
          website favicons.
        </LI>
        <LI>
          <strong>Optional sync.</strong> If you create an account and sign in, your saved tabs and
          collections are sent to and stored on our server so they follow you across devices. Sign-in is
          optional and off by default.
        </LI>
        <LI>We do not sell or rent your data, show ads, or run third-party analytics.</LI>
      </ul>

      <H2>What is stored on your device</H2>
      <ul>
        <LI>The Spaces, Collections, and saved tabs you create — their titles, URLs, and optional descriptions.</LI>
        <LI>Your interface preferences (theme, view mode, sort order, active space).</LI>
        <LI>When signed in: your account email and sign-in tokens, sent only to our API.</LI>
      </ul>
      <P>
        You can remove local data at any time by deleting items in the extension, or by removing the
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
          <strong>Your content.</strong> The Spaces, Collections, and saved tabs you sync — their titles,
          URLs, and descriptions — are transmitted to and stored on our server to sync to your other devices.
        </LI>
        <LI>
          <strong>Transactional email.</strong> We email you to verify your address and reset your
          password. We do not send marketing email.
        </LI>
        <LI>
          <strong>Security signals.</strong> We process your IP address transiently to rate-limit abuse of
          the sign-in and password endpoints.
        </LI>
      </ul>
      <P>
        You can stop syncing at any time by signing out. To delete your account and the data stored on our
        server, contact us at the address below.
      </P>

      <H2>Service providers (subprocessors)</H2>
      <P>When sync is used, your data is processed by these providers on our behalf — never sold:</P>
      <ul>
        <LI><strong>MongoDB Atlas</strong> — hosts the synced database.</LI>
        <LI><strong>Resend</strong> — sends verification and password-reset email.</LI>
        <LI><strong>Upstash</strong> — rate-limiting to protect the auth endpoints.</LI>
        <LI><strong>Vercel</strong> — hosts the sync API.</LI>
      </ul>

      <H2>Browser permissions and why they are used</H2>
      <ul>
        <LI><strong>tabs</strong> — to read the titles and URLs of your open tabs so you can save and restore them, only when you act.</LI>
        <LI><strong>storage</strong> — to save your spaces, collections, preferences, and (when signed in) your session on your device.</LI>
        <LI><strong>alarms</strong> — a lightweight periodic timer to keep your sign-in session token fresh while signed in; it transmits nothing when signed out.</LI>
      </ul>

      <H2>Favicons (third-party request)</H2>
      <P>
        To show a website&rsquo;s icon, the extension loads favicons from Google&rsquo;s public favicon
        service (<code>https://www.google.com/s2/favicons</code>). That request includes only the domain
        name (e.g. <code>example.com</code>) of the site whose icon is shown. Google&rsquo;s handling is
        governed by Google&rsquo;s own privacy policy.
      </P>

      <H2>Data sharing and sale</H2>
      <P>
        We do not sell, rent, or share your data with anyone for their own purposes. There is no
        advertising or third-party analytics. Data is shared only with the providers above, solely to operate sync.
      </P>

      <H2>Data retention and deletion</H2>
      <ul>
        <LI>Local data is removed when you delete items or uninstall the extension.</LI>
        <LI>Synced data persists on our server until you delete it or request account deletion. Email us to delete your account and server data.</LI>
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
