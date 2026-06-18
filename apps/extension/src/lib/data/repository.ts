import type { UiPreferences, WorkspaceData } from "@vctabs/shared";
import { getLocal, setLocal } from "../chrome/storage";
import { buildSeed } from "./seed";

const WORKSPACE_KEY = "vctabs.workspace.v1";
const PREFS_KEY = "vctabs.prefs.v1";

/** Loads the workspace, seeding sample data on first run. */
export async function loadWorkspace(): Promise<WorkspaceData> {
  const stored = await getLocal<WorkspaceData | null>(WORKSPACE_KEY, null);
  if (stored && stored.spaces.length > 0) return stored;
  const seeded = buildSeed();
  await saveWorkspace(seeded);
  return seeded;
}

export async function saveWorkspace(data: WorkspaceData): Promise<void> {
  await setLocal(WORKSPACE_KEY, data);
}

export async function loadPrefs(): Promise<UiPreferences> {
  return getLocal<UiPreferences>(PREFS_KEY, {
    theme: "light",
    viewMode: "card",
    sortMode: "manual",
    activeSpaceId: null,
  });
}

export async function savePrefs(prefs: UiPreferences): Promise<void> {
  await setLocal(PREFS_KEY, prefs);
}
