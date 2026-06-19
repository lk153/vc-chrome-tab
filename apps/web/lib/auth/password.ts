import { hash, hashSync, verify } from "@node-rs/argon2";

// argon2id with OWASP-baseline parameters (19 MiB, 2 passes). @node-rs/argon2
// ships prebuilt N-API binaries, so there's no native build step on Vercel.
const OPTS = { memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const;

// Fixed dummy hash so login on an UNKNOWN email still does equal work — closes
// the timing oracle that would otherwise reveal which emails exist.
const DUMMY_HASH = hashSync("vctabs-dummy-password-comparison", OPTS);

export async function hashPassword(password: string): Promise<string> {
  return hash(password, OPTS);
}

export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  // Verify against the dummy when no user exists so timing stays constant.
  try {
    return await verify(stored ?? DUMMY_HASH, password);
  } catch {
    return false;
  }
}
