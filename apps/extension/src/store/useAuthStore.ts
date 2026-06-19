import { create } from "zustand";
import type { AuthUser } from "@vctabs/shared";
import {
  clearSession,
  getSession,
  loadSession,
  saveSession,
  subscribeSession,
  updateUser,
} from "@/lib/api/session";
import {
  loginApi,
  logoutApi,
  meApi,
  registerApi,
  requestPasswordResetApi,
  resendVerificationApi,
} from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { startSync, stopSync } from "@/lib/sync/engine";

type Status = "loading" | "signedOut" | "signedIn";

interface ResendResult {
  ok: boolean;
  alreadyVerified?: boolean;
}

interface AuthState {
  status: Status;
  user: AuthUser | null;
  error: string | null;
  busy: boolean;
  init: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  resendVerification: () => Promise<ResendResult | null>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  let started = false;

  // Pull a fresh profile so emailVerified reflects verification done in the
  // browser since the cached session was saved. Silent on failure (offline).
  const refreshUser = async (): Promise<void> => {
    try {
      const { user } = await meApi();
      await updateUser(user);
      if (get().status === "signedIn") set({ user });
    } catch {
      /* keep cached user */
    }
  };

  const authenticate = async (run: () => ReturnType<typeof loginApi>): Promise<boolean> => {
    set({ busy: true, error: null });
    try {
      const res = await run();
      await saveSession(res);
      set({ status: "signedIn", user: res.user, busy: false });
      void startSync(res.user.id);
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Can't reach the sync server. Is it running?";
      set({ busy: false, error: message });
      return false;
    }
  };

  return {
    status: "loading",
    user: null,
    error: null,
    busy: false,

    init: async () => {
      if (started) return;
      started = true;
      const session = await loadSession();
      if (session) {
        set({ status: "signedIn", user: session.user });
        void startSync(session.user.id);
        void refreshUser();
      } else {
        set({ status: "signedOut" });
      }
      // Reflect sign-out/refresh-failure or sign-in that happened in another context.
      subscribeSession((next) => {
        if (!next && get().status === "signedIn") {
          stopSync();
          set({ status: "signedOut", user: null });
        } else if (next && get().status !== "signedIn") {
          set({ status: "signedIn", user: next.user });
          void startSync(next.user.id);
        }
      });
    },

    signUp: (email, password) => authenticate(() => registerApi(email, password)),
    signIn: (email, password) => authenticate(() => loginApi(email, password)),

    signOut: async () => {
      const session = getSession();
      stopSync();
      if (session) await logoutApi(session.tokens.refreshToken).catch(() => {});
      await clearSession();
      set({ status: "signedOut", user: null });
    },

    resendVerification: async () => {
      try {
        const res = await resendVerificationApi();
        if (res.alreadyVerified) await refreshUser();
        return res;
      } catch {
        return null;
      }
    },

    requestPasswordReset: async (email) => {
      try {
        await requestPasswordResetApi(email);
        return true;
      } catch {
        return false;
      }
    },

    clearError: () => set({ error: null }),
  };
});
