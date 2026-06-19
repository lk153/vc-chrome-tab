import type { Collection as MongoCollection } from "mongodb";
import { getDb } from "./client";
import type { CollectionDoc, RefreshTokenDoc, SpaceDoc, TabDoc, UserDoc } from "./types";

export async function usersCol(): Promise<MongoCollection<UserDoc>> {
  return (await getDb()).collection<UserDoc>("users");
}

export async function refreshTokensCol(): Promise<MongoCollection<RefreshTokenDoc>> {
  return (await getDb()).collection<RefreshTokenDoc>("refreshTokens");
}

export async function spacesCol(): Promise<MongoCollection<SpaceDoc>> {
  return (await getDb()).collection<SpaceDoc>("spaces");
}

export async function collectionsCol(): Promise<MongoCollection<CollectionDoc>> {
  return (await getDb()).collection<CollectionDoc>("collections");
}

export async function tabsCol(): Promise<MongoCollection<TabDoc>> {
  return (await getDb()).collection<TabDoc>("tabs");
}
