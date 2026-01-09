type FeatureFlags = {
  ai?: boolean;
  billing?: boolean;
  upload?: boolean;
};

const requiredBase = [
  "DATABASE_URL",
  "NEXT_PUBLIC_APP_URL",
  "UPLOADTHING_SECRET",
];

const requiredAi = ["REPLICATE_API_TOKEN"];
const requiredBilling = [
  "STRIPE_SECRET_KEY",
  "STRIPE_PRICE_ID",
  "STRIPE_WEBHOOK_SECRET",
];

const isBillingEnabled = () => {
  return (
    process.env.ENABLE_BILLING === "true" ||
    requiredBilling.some((key) => !!process.env[key])
  );
};

const isAiEnabled = () => {
  return (
    process.env.ENABLE_AI === "true" ||
    requiredAi.some((key) => !!process.env[key])
  );
};

export const validateServerEnv = (flags: FeatureFlags = {}) => {
  if (typeof window !== "undefined") {
    return;
  }

  const missing = requiredBase.filter((key) => !process.env[key]);

  if (flags.ai && isAiEnabled()) {
    missing.push(...requiredAi.filter((key) => !process.env[key]));
  }

  if (flags.billing && isBillingEnabled()) {
    missing.push(...requiredBilling.filter((key) => !process.env[key]));
  }

  if (flags.upload) {
    if (!process.env.UPLOADTHING_SECRET) {
      missing.push("UPLOADTHING_SECRET");
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
};
