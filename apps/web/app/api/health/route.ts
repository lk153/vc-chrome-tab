import { getDb } from "@/lib/db/client";
import { json, errorJson } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return json({ ok: true, db: db.databaseName });
  } catch (err) {
    return errorJson(500, err instanceof Error ? err.message : "db error");
  }
}
