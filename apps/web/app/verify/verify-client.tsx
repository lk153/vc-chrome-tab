"use client";

import { useEffect, useState } from "react";
import { Shell, Title } from "../_ui";

type State = "loading" | "ok" | "error";

export function VerifyClient() {
  const [state, setState] = useState<State>("loading");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    // Strip the token from the address bar + history right away.
    window.history.replaceState(null, "", window.location.pathname);

    if (!token) {
      setState("error");
      setMsg("This link is missing its verification token.");
      return;
    }

    void (async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (res.ok) setState("ok");
        else {
          setState("error");
          setMsg(data.error ?? "Verification failed.");
        }
      } catch {
        setState("error");
        setMsg("Couldn't reach the server. Please try again.");
      }
    })();
  }, []);

  return (
    <Shell>
      {state === "loading" && <Title sub="Verifying your email…">One moment</Title>}
      {state === "ok" && (
        <Title sub="Your email is verified. You can close this tab and return to the VC Tabs extension.">
          ✓ Email verified
        </Title>
      )}
      {state === "error" && <Title sub={msg}>Verification failed</Title>}
    </Shell>
  );
}
