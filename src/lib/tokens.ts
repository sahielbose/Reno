import { randomBytes } from "node:crypto";

/** A URL-safe, single-purpose access token for signer/pay/portal links. */
export function generateToken(): string {
  return randomBytes(24).toString("base64url");
}
