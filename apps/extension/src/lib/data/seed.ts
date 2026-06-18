import { newId, type Collection, type SavedTab, type Space, type WorkspaceData } from "@vctabs/shared";
import { faviconFor } from "./favicon";

/**
 * First-run sample workspace, modeled on the reference design (Spaces in the
 * sidebar; Devops / WorkSpace / Documents / Everyday collections of tabs).
 * Replaced by the user's own data as soon as they edit anything.
 */
export function buildSeed(): WorkspaceData {
  const now = Date.now();
  const spaces = buildSpaces(now);
  const myCollections = spaces[0].id;

  const collections: Collection[] = [];
  const tabs: SavedTab[] = [];

  const groups: [string, [string, string][]][] = [
    [
      "Devops",
      [
        ["Unleash — Feature Flags", "https://unleash.example.com"],
        ["Prometheus", "https://prometheus.io"],
        ["Dashboards — Grafana", "https://grafana.example.com"],
        ["Argo Rollouts", "https://argoproj.github.io/rollouts"],
        ["Namespaces", "https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces"],
      ],
    ],
    [
      "WorkSpace",
      [
        ["AI Chatbot", "https://chat.example.com"],
        ["GitLab", "https://gitlab.com"],
        ["TODO — MOET-T4", "https://jira.example.com/browse/MOET-T4"],
        ["Room Booking Hub", "https://rooms.example.com"],
        ["Work Item Search — Jira", "https://jira.example.com/issues"],
      ],
    ],
    [
      "Documents",
      [
        ["Onboarding Guide & Checklist", "https://docs.google.com/document/onboarding"],
        ["Leave Policies & Procedures", "https://docs.google.com/document/leave"],
      ],
    ],
    [
      "Everyday",
      [
        ["Edit-in Figma", "https://figma.com"],
        ["ChatChit", "https://chat.example.com/chit"],
        ["Status Page", "https://status.example.com"],
        ["AI Chatbot Management", "https://chat.example.com/manage"],
      ],
    ],
  ];

  groups.forEach(([name, links], gi) => {
    const collection = makeCollection(myCollections, name, gi, now);
    collections.push(collection);
    links.forEach(([title, url], ti) => {
      tabs.push(makeTab(collection.id, title, url, ti, now));
    });
  });

  return { spaces, collections, tabs };
}

function buildSpaces(now: number): Space[] {
  // Ship a single, populated space. Users add more via the sidebar "+".
  const names: [string, string][] = [["My Collections", "📁"]];
  return names.map(([name, icon], i) => ({
    id: newId(),
    name,
    icon,
    order: i,
    createdAt: now,
    updatedAt: now,
  }));
}

function makeCollection(spaceId: string, name: string, order: number, now: number): Collection {
  return { id: newId(), spaceId, name, order, collapsed: false, createdAt: now, updatedAt: now };
}

function makeTab(collectionId: string, title: string, url: string, order: number, now: number): SavedTab {
  return {
    id: newId(),
    collectionId,
    title,
    url,
    faviconUrl: faviconFor(url),
    starred: false,
    order,
    createdAt: now,
    updatedAt: now,
  };
}
