import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { appSettings, oauthProviders } from "@/db/schema";
import {
  DEFAULT_FREE_PROJECT_LIMIT,
  DEFAULT_FREE_TEMPLATE_LIMIT,
} from "@/lib/free-tier";

export const DEFAULT_APP_SETTINGS = {
  freeProjectLimit: DEFAULT_FREE_PROJECT_LIMIT,
  freeTemplateLimit: DEFAULT_FREE_TEMPLATE_LIMIT,
  freeAllowsAi: false,
  freeAllowsBgRemoval: false,
  freeAllowsExport: true,
};

export type AppSettings = typeof DEFAULT_APP_SETTINGS & {
  id: string | null;
  updatedAt: Date | null;
};

export const getAppSettings = async (): Promise<AppSettings> => {
  const [row] = await db.select().from(appSettings).limit(1);

  if (!row) {
    return {
      ...DEFAULT_APP_SETTINGS,
      id: null,
      updatedAt: null,
    };
  }

  return {
    id: row.id,
    freeProjectLimit: row.freeProjectLimit,
    freeTemplateLimit: row.freeTemplateLimit,
    freeAllowsAi: row.freeAllowsAi,
    freeAllowsBgRemoval: row.freeAllowsBgRemoval,
    freeAllowsExport: row.freeAllowsExport,
    updatedAt: row.updatedAt,
  };
};

export const DEFAULT_OAUTH_PROVIDERS = ["github", "google"] as const;

export type OAuthProviderKey = (typeof DEFAULT_OAUTH_PROVIDERS)[number];

export type OAuthProviderSettings = {
  provider: OAuthProviderKey;
  enabled: boolean;
  clientId: string | null;
  hasSecret: boolean;
};

export const getOAuthProviderSettings = async (): Promise<OAuthProviderSettings[]> => {
  const rows = await db.select().from(oauthProviders);
  const indexed = new Map(rows.map((row) => [row.provider, row]));

  return DEFAULT_OAUTH_PROVIDERS.map((provider) => {
    const entry = indexed.get(provider);

    return {
      provider,
      enabled: entry?.enabled ?? false,
      clientId: entry?.clientId ?? null,
      hasSecret: Boolean(entry?.clientSecret),
    };
  });
};

export type OAuthProviderCredentials = Record<OAuthProviderKey, {
  enabled: boolean;
  clientId: string | null;
  clientSecret: string | null;
}>;

export const getOAuthProviderCredentials = async (): Promise<OAuthProviderCredentials> => {
  const rows = await db.select().from(oauthProviders);
  const indexed = new Map(rows.map((row) => [row.provider, row]));

  return DEFAULT_OAUTH_PROVIDERS.reduce((acc, provider) => {
    const entry = indexed.get(provider);
    acc[provider] = {
      enabled: entry?.enabled ?? false,
      clientId: entry?.clientId ?? null,
      clientSecret: entry?.clientSecret ?? null,
    };
    return acc;
  }, {} as OAuthProviderCredentials);
};

export const getOAuthProviderStatus = async (provider: OAuthProviderKey) => {
  const [row] = await db
    .select()
    .from(oauthProviders)
    .where(eq(oauthProviders.provider, provider));

  if (!row) {
    return {
      enabled: false,
      clientId: null,
      clientSecret: null,
    };
  }

  return {
    enabled: row.enabled,
    clientId: row.clientId ?? null,
    clientSecret: row.clientSecret ?? null,
  };
};
