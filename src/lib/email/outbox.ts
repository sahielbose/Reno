import "server-only";

import type { Mailer } from "@/lib/email/interface";
import { createResendMailer } from "@/lib/email/resend";

/**
 * Dev mailer — logs to the server console ("outbox") instead of sending.
 * In production, Resend takes over behind this same Mailer interface.
 */
export const consoleMailer: Mailer = {
  async send(message) {
    console.log(
      `\n📧 [outbox] → ${message.to}\n   ${message.subject}\n   ${message.body}\n`,
    );
  },
};

/** Resend when RESEND_API_KEY is configured; otherwise the console outbox. */
export function getMailer(): Mailer {
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const from = process.env.RESEND_FROM ?? "Reno <noreply@reno.build>";
    return createResendMailer(apiKey, from);
  }
  return consoleMailer;
}
