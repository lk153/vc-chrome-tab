import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { PRIVACY_URL } from "@/lib/api/config";
import { useAuthStore } from "@/store/useAuthStore";

/** Login / register dialog. Sign-in is optional — it just enables cloud sync. */
export function AuthDialog({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const busy = useAuthStore((s) => s.busy);
  const error = useAuthStore((s) => s.error);
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const requestPasswordReset = useAuthStore((s) => s.requestPasswordReset);
  const clearError = useAuthStore((s) => s.clearError);

  const [notice, setNotice] = useState<string | null>(null);
  const [resetBusy, setResetBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await (mode === "login" ? signIn(email, password) : signUp(email, password));
    if (ok) onClose();
  };

  const onForgot = async () => {
    if (!email.trim()) {
      setNotice("Enter your email above, then tap “Forgot password?” again.");
      return;
    }
    setResetBusy(true);
    const ok = await requestPasswordReset(email.trim());
    setResetBusy(false);
    setNotice(
      ok
        ? "If an account exists for that email, a reset link is on its way."
        : "Couldn't send a reset link just now — try again shortly.",
    );
  };

  const switchTo = (next: "login" | "register") => {
    setMode(next);
    setNotice(null);
    clearError();
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="headline-small mb-1 text-on-surface">
        {mode === "login" ? "Sign in" : "Create account"}
      </h2>
      <p className="body-medium mb-5 text-on-surface-variant">
        Sync your spaces and collections across devices.
      </p>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="m3-field"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          required
        />
        <input
          className="m3-field"
          type="password"
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
        {error && <p className="body-small text-error">{error}</p>}
        {notice && <p className="body-small text-on-surface-variant">{notice}</p>}
        <Button type="submit" variant="filled" className="w-full" disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      {mode === "login" && (
        <button
          type="button"
          onClick={() => void onForgot()}
          disabled={resetBusy}
          className="mt-3 body-small text-on-surface-variant hover:text-primary disabled:opacity-50"
        >
          {resetBusy ? "Sending…" : "Forgot password?"}
        </button>
      )}

      <p className="mt-4 body-small text-on-surface-variant">
        {mode === "login" ? (
          <>
            No account?{" "}
            <button type="button" onClick={() => switchTo("register")} className="text-primary">
              Create one
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button type="button" onClick={() => switchTo("login")} className="text-primary">
              Sign in
            </button>
          </>
        )}
      </p>

      <p className="mt-2 body-small text-on-surface-variant">
        By continuing you agree to our{" "}
        <a href={PRIVACY_URL} target="_blank" rel="noreferrer" className="text-primary hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </Modal>
  );
}
