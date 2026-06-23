/** Payment provider abstraction - Stripe in production, a no-op locally. */
export interface PaymentLink {
  id: string;
  url: string;
}

export interface PaymentProvider {
  readonly live: boolean;
  createCheckout(input: {
    amountCents: number;
    description: string;
    invoiceId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<PaymentLink>;
}
