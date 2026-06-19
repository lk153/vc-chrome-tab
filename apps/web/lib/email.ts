/**
 * Transactional email via Resend. When RESEND_API_KEY is absent we don't send —
 * we print the link to the server console (dev fallback) and, in development,
 * the calling route may surface the link in its JSON response so the flow is
 * testable on localhost without configuring Resend.
 */
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || "VC Tabs <onboarding@resend.dev>";
const resend = apiKey ? new Resend(apiKey) : null;

/** Real emails are only exposed as response links in dev when Resend is off. */
const exposeDevLinks = !resend && process.env.NODE_ENV !== "production";

/** Returns the link to surface in a dev response, or undefined in prod / with Resend. */
export function devLink(link: string): string | undefined {
  return exposeDevLinks ? link : undefined;
}

export async function sendVerifyEmail(to: string, link: string): Promise<void> {
  await send(
    to,
    "Verify your VC Tabs email",
    layout(
      "Confirm your email",
      "Tap the button below to verify your email address and finish setting up VC Tabs sync.",
      "Verify email",
      link,
    ),
    `Verify your VC Tabs email:\n${link}`,
  );
}

export async function sendResetEmail(to: string, link: string): Promise<void> {
  await send(
    to,
    "Reset your VC Tabs password",
    layout(
      "Reset your password",
      "We received a request to reset your VC Tabs password. This link expires in 1 hour. If you didn't ask for this, you can ignore this email.",
      "Reset password",
      link,
    ),
    `Reset your VC Tabs password (expires in 1 hour):\n${link}`,
  );
}

async function send(to: string, subject: string, html: string, text: string): Promise<void> {
  if (!resend) {
    console.log(
      `\n──── [email:dev] ────\nTo:      ${to}\nSubject: ${subject}\n${text}\n─────────────────────\n`,
    );
    return;
  }
  try {
    // The Resend SDK resolves with { data, error } — it does not throw on API
    // errors, so we have to inspect the returned error explicitly.
    const { data, error } = await resend.emails.send({ from, to, subject, html, text });
    if (error) console.error(`[email] resend rejected (${subject} → ${to}):`, error);
    else console.log(`[email] sent "${subject}" → ${to} (id ${data?.id ?? "?"})`);
  } catch (err) {
    console.error("[email] send threw:", err);
  }
}

/** Minimal branded HTML shell shared by all messages. */
function layout(heading: string, body: string, cta: string, link: string): string {
  return `<!doctype html><html><body style="margin:0;background:#eef1ec;font-family:'Hanken Grotesk',-apple-system,Segoe UI,Roboto,sans-serif;color:#1a1c19">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:480px;background:#fff;border-radius:16px;padding:32px">
        <tr><td>
          <div style="font-size:18px;font-weight:800;color:#147a4a;margin-bottom:24px">VC Tabs</div>
          <div style="font-size:22px;font-weight:700;margin-bottom:12px">${heading}</div>
          <div style="font-size:15px;line-height:1.6;color:#43483e;margin-bottom:28px">${body}</div>
          <a href="${link}" style="display:inline-block;background:#147a4a;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 24px;border-radius:999px">${cta}</a>
          <div style="font-size:12px;color:#74796d;margin-top:28px;word-break:break-all">Or paste this link into your browser:<br>${link}</div>
        </td></tr>
      </table>
      <div style="font-size:12px;color:#74796d;margin-top:16px">VC Tabs · local tab management with optional cloud sync</div>
    </td></tr>
  </table>
</body></html>`;
}
