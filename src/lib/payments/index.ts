import "server-only";

import type { PaymentProvider } from "@/lib/payments/interface";
import { createStripeProvider } from "@/lib/payments/stripe";

/** Disabled provider used when Stripe isn't configured (record payments by hand). */
export const nullPaymentProvider: PaymentProvider = {
  live: false,
  async createCheckout() {
    throw new Error(
      "Online payments are not configured (set STRIPE_SECRET_KEY).",
    );
  },
};

/** Stripe when STRIPE_SECRET_KEY is configured; otherwise the no-op provider. */
export function getPaymentProvider(): PaymentProvider {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (secretKey) return createStripeProvider(secretKey);
  return nullPaymentProvider;
}

export type { PaymentProvider, PaymentLink } from "@/lib/payments/interface";
