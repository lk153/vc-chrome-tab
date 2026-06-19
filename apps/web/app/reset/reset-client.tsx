"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Shell, Title, buttonStyle, inputStyle } from "../_ui";

type State = "form" | "submitting" | "done" | "missing";

export function ResetClient() {
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<State>("form");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    window.history.replaceState(null, "", window.location.pathname);
    if (!t) setState("missing");
    else setToken(t);
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords don't match.");

    setState("submitting");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) setState("done");
      else {
        setError(data.error ?? "Reset failed.");
        setState("form");
      }
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setState("form");
    }
  };

  if (state === "missing") {
    return (
      <Shell>
        <Title sub="This reset link is missing its token. Request a new one from the extension.">
          Invalid link
        </Title>
      </Shell>
    );
  }

  if (state === "done") {
    return (
      <Shell>
        <Title sub="Your password has been changed and all other sessions were signed out. Sign in with your new password in the VC Tabs extension.">
          ✓ Password updated
        </Title>
      </Shell>
    );
  }

  return (
    <Shell>
      <Title sub="Choose a new password for your VC Tabs account.">Reset your password</Title>
      <form onSubmit={onSubmit} style={{ marginTop: 22, display: "grid", gap: 12 }}>
        <input
          type="password"
          placeholder="New password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          style={inputStyle}
        />
        {error && <div style={{ color: "#ba1a1a", fontSize: 13 }}>{error}</div>}
        <button type="submit" disabled={state === "submitting"} style={buttonStyle}>
          {state === "submitting" ? "Updating…" : "Update password"}
        </button>
      </form>
    </Shell>
  );
}
