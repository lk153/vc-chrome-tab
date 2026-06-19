import { useState } from "react";
import { IconX } from "@/components/icons";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "@/store/useToastStore";

/** Slim banner prompting an unverified signed-in user to confirm their email. */
export function VerifyBanner() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const resend = useAuthStore((s) => s.resendVerification);
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);

  if (status !== "signedIn" || !user || user.emailVerified || dismissed) return null;

  const onResend = async () => {
    setBusy(true);
    const res = await resend();
    setBusy(false);
    if (!res) {
      toast("Couldn't send — try again");
    } else if (res.alreadyVerified) {
      toast("Email already verified");
      setDismissed(true);
    } else {
      toast("Verification email sent");
    }
  };

  return (
    <div className="flex items-center gap-3 border-b border-outline-variant bg-primary-container/40 px-6 py-2.5">
      <span className="min-w-0 flex-1 truncate body-small text-on-surface">
        Verify <span className="font-semibold">{user.email}</span> to secure your account and email reset links.
      </span>
      <button
        type="button"
        onClick={() => void onResend()}
        disabled={busy}
        className="shrink-0 label-large font-semibold text-primary hover:underline disabled:opacity-50"
      >
        {busy ? "Sending…" : "Resend email"}
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="m3-icon-btn h-7 w-7 shrink-0"
        aria-label="Dismiss"
        title="Dismiss"
      >
        <IconX size={15} />
      </button>
    </div>
  );
}
