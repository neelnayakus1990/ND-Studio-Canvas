import Stripe from "stripe";

import { isBillingEnabled } from "@/lib/env";

let stripeInstance: Stripe | null = null;

export const getStripe = () => {
  if (!isBillingEnabled()) {
    return null;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
      typescript: true,
    });
  }

  return stripeInstance;
};
