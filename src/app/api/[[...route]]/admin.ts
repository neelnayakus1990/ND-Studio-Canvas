import { z } from "zod";
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";
import { zValidator } from "@hono/zod-validator";

import { db } from "@/db/drizzle";
import { appSettings, oauthProviders } from "@/db/schema";
import { isAdminEmail } from "@/lib/admin";
import {
  DEFAULT_APP_SETTINGS,
  DEFAULT_OAUTH_PROVIDERS,
  getAppSettings,
  getOAuthProviderSettings,
} from "@/lib/settings";

const providerSchema = z.enum(DEFAULT_OAUTH_PROVIDERS);

const ensureAdmin = (email?: string | null) => {
  if (!isAdminEmail(email)) {
    return false;
  }

  return true;
};

const app = new Hono()
  .get("/me", verifyAuth(), async (c) => {
    const auth = c.get("authUser");
    const email = auth.token?.email ?? null;

    return c.json({ data: { isAdmin: ensureAdmin(email) } });
  })
  .get("/settings", verifyAuth(), async (c) => {
    const auth = c.get("authUser");
    const email = auth.token?.email ?? null;

    if (!ensureAdmin(email)) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const settings = await getAppSettings();
    return c.json({ data: settings });
  })
  .patch(
    "/settings",
    verifyAuth(),
    zValidator(
      "json",
      z.object({
        freeProjectLimit: z.coerce.number().min(0),
        freeTemplateLimit: z.coerce.number().min(0),
        freeAllowsAi: z.boolean(),
        freeAllowsBgRemoval: z.boolean(),
        freeAllowsExport: z.boolean(),
      })
    ),
    async (c) => {
      const auth = c.get("authUser");
      const email = auth.token?.email ?? null;

      if (!ensureAdmin(email)) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const values = c.req.valid("json");
      const [existing] = await db.select().from(appSettings).limit(1);

      if (!existing) {
        const [created] = await db
          .insert(appSettings)
          .values({
            ...DEFAULT_APP_SETTINGS,
            ...values,
            updatedAt: new Date(),
          })
          .returning();

        return c.json({ data: created });
      }

      const [updated] = await db
        .update(appSettings)
        .set({
          ...values,
          updatedAt: new Date(),
        })
        .where(eq(appSettings.id, existing.id))
        .returning();

      return c.json({ data: updated });
    }
  )
  .get("/oauth", verifyAuth(), async (c) => {
    const auth = c.get("authUser");
    const email = auth.token?.email ?? null;

    if (!ensureAdmin(email)) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const data = await getOAuthProviderSettings();
    return c.json({ data });
  })
  .put(
    "/oauth",
    verifyAuth(),
    zValidator(
      "json",
      z.object({
        provider: providerSchema,
        enabled: z.boolean(),
        clientId: z.string().optional(),
        clientSecret: z.string().optional(),
      })
    ),
    async (c) => {
      const auth = c.get("authUser");
      const email = auth.token?.email ?? null;

      if (!ensureAdmin(email)) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { provider, enabled, clientId, clientSecret } = c.req.valid("json");
      const [existing] = await db
        .select()
        .from(oauthProviders)
        .where(eq(oauthProviders.provider, provider));

      if (!existing) {
        const [created] = await db
          .insert(oauthProviders)
          .values({
            provider,
            enabled,
            clientId: clientId ?? null,
            clientSecret: clientSecret ?? null,
            updatedAt: new Date(),
          })
          .returning();

        return c.json({
          data: {
            provider: created.provider,
            enabled: created.enabled,
            clientId: created.clientId,
            hasSecret: Boolean(created.clientSecret),
          },
        });
      }

      const [updated] = await db
        .update(oauthProviders)
        .set({
          enabled,
          clientId: clientId ?? existing.clientId,
          clientSecret: clientSecret ? clientSecret : existing.clientSecret,
          updatedAt: new Date(),
        })
        .where(eq(oauthProviders.provider, provider))
        .returning();

      return c.json({
        data: {
          provider: updated.provider,
          enabled: updated.enabled,
          clientId: updated.clientId,
          hasSecret: Boolean(updated.clientSecret),
        },
      });
    }
  );

export default app;
