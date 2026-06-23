import "server-only";

import type { Mailer } from "@/lib/email/interface";

/**
 * Resend mailer via the REST API (no SDK dependency). Activated by getMailer()
 * when RESEND_API_KEY is set; until then the console "outbox" is used.
 */
export function createResendMailer(apiKey: string, from: string): Mailer {
  return {
    async send(message) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: message.to,
          subject: message.subject,
          text: message.body,
        }),
      });
      if (!res.ok) {
        throw new Error(`Resend ${res.status}: ${await res.text()}`);
      }
    },
  };
}
