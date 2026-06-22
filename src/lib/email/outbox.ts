import "server-only";

import type { Mailer } from "@/lib/email/interface";

/**
 * Dev mailer — logs to the server console ("outbox") instead of sending.
 * Phase 19 swaps in Resend behind this same Mailer interface.
 */
export const consoleMailer: Mailer = {
  async send(message) {
    console.log(
      `\n📧 [outbox] → ${message.to}\n   ${message.subject}\n   ${message.body}\n`,
    );
  },
};

export function getMailer(): Mailer {
  return consoleMailer;
}
