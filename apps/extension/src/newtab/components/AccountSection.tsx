import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { IconCloud, IconLogout } from "@/components/icons";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthDialog } from "./auth/AuthDialog";

/** Sidebar account area: optional sign-in (enables sync) or the signed-in user. */
export function AccountSection() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="px-3 pb-1 pt-2">
      {status === "signedIn" && user ? (
        <div className="flex items-center gap-2.5 rounded-m3-md bg-surface-container-high px-3 py-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary label-small text-on-primary">
            {user.email[0]?.toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate body-small text-on-surface">{user.email}</p>
            <p className="label-small text-primary">Synced</p>
          </div>
          <IconButton label="Sign out" onClick={() => void signOut()} className="h-8 w-8">
            <IconLogout size={16} />
          </IconButton>
        </div>
      ) : (
        <Button
          variant="tonal"
          className="w-full"
          disabled={status === "loading"}
          onClick={() => setDialogOpen(true)}
        >
          <IconCloud size={18} />
          Sign in to sync
        </Button>
      )}

      {dialogOpen && <AuthDialog onClose={() => setDialogOpen(false)} />}
    </div>
  );
}
