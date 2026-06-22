import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

import type { Storage } from "@/lib/storage/interface";

const ROOT = path.join(process.cwd(), ".uploads");

/** Reject keys that try to escape the uploads root. */
function safePath(key: string): string {
  const resolved = path.join(ROOT, key);
  if (!resolved.startsWith(ROOT + path.sep)) {
    throw new Error("Invalid storage key");
  }
  return resolved;
}

export const localStorage: Storage = {
  async put(key, data) {
    const p = safePath(key);
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, data);
  },
  async get(key) {
    try {
      return await fs.readFile(safePath(key));
    } catch {
      return null;
    }
  },
  async delete(key) {
    try {
      await fs.unlink(safePath(key));
    } catch {
      // already gone
    }
  },
};

/** The active storage backend. Phase 19 returns an S3/R2 adapter. */
export function getStorage(): Storage {
  return localStorage;
}
