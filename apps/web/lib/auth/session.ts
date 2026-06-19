import type { AuthUser } from "@vctabs/shared";
import { usersCol } from "../db/collections";
import type { UserDoc } from "../db/types";
import { verifyAccessToken } from "./tokens";

/** Resolve the authenticated user from the Authorization: Bearer header. */
export async function userFromRequest(req: Request): Promise<UserDoc | null> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const claims = await verifyAccessToken(header.slice(7));
  if (!claims) return null;
  const user = await (await usersCol()).findOne({ id: claims.sub });
  if (!user) return null;
  // Reject access tokens minted before the last revocation (password reset,
  // "log out everywhere") — we already loaded the user, so this check is free.
  if (claims.tv !== user.tokenVersion) return null;
  return user;
}

export function toAuthUser(user: UserDoc): AuthUser {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    displayName: user.displayName,
  };
}
