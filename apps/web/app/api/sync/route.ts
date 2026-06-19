import type { SyncPushBody } from "@vctabs/shared";
import { collectionsCol, spacesCol, tabsCol } from "@/lib/db/collections";
import { userFromRequest } from "@/lib/auth/session";
import { applyDeletes, applyUpserts, pullChanges } from "@/lib/sync/store";
import { errorJson, json, preflight } from "@/lib/http";

export const runtime = "nodejs";

export async function OPTIONS(req: Request) {
  return preflight(req.headers.get("origin"));
}

/** Delta pull: everything changed since ?since=<ms>. */
export async function GET(req: Request) {
  const origin = req.headers.get("origin");
  const user = await userFromRequest(req);
  if (!user) return errorJson(401, "Unauthorized", origin);

  const since = Number(new URL(req.url).searchParams.get("since")) || 0;
  const now = Date.now();
  const [s, c, t] = await Promise.all([
    pullChanges(await spacesCol(), user.id, since),
    pullChanges(await collectionsCol(), user.id, since),
    pullChanges(await tabsCol(), user.id, since),
  ]);

  return json(
    {
      now,
      spaces: s.upserts,
      collections: c.upserts,
      tabs: t.upserts,
      deleted: { spaces: s.deletedIds, collections: c.deletedIds, tabs: t.deletedIds },
    },
    200,
    origin,
  );
}

/** Batched push: upserts + deletions to apply (owner-scoped, LWW). */
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const user = await userFromRequest(req);
  if (!user) return errorJson(401, "Unauthorized", origin);

  const body = (await req.json().catch(() => null)) as SyncPushBody | null;
  if (!body) return errorJson(400, "Invalid sync body", origin);

  const now = Date.now();
  const [sp, cp, tp] = await Promise.all([spacesCol(), collectionsCol(), tabsCol()]);

  await Promise.all([
    applyUpserts(sp, user.id, body.spaces ?? [], now),
    applyUpserts(cp, user.id, body.collections ?? [], now),
    applyUpserts(tp, user.id, body.tabs ?? [], now),
  ]);
  await Promise.all([
    applyDeletes(sp, user.id, body.deleted?.spaces ?? [], now),
    applyDeletes(cp, user.id, body.deleted?.collections ?? [], now),
    applyDeletes(tp, user.id, body.deleted?.tabs ?? [], now),
  ]);

  return json({ now }, 200, origin);
}
