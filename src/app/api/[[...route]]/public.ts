import { z } from "zod";
import { Hono } from "hono";
import { eq, and, desc } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";

import { db } from "@/db/drizzle";
import { assets, projects } from "@/db/schema";
import { getSystemUserId } from "@/lib/system-user";
import { getAppSettings, getOAuthProviderSettings } from "@/lib/settings";
import { isBillingEnabled } from "@/lib/env";

const app = new Hono()
  .get("/templates", async (c) => {
    const systemUserId = await getSystemUserId();

    if (!systemUserId) {
      return c.json({ data: [] });
    }

    const data = await db
      .select({
        id: projects.id,
        name: projects.name,
        width: projects.width,
        height: projects.height,
        thumbnailUrl: projects.thumbnailUrl,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .where(
        and(
          eq(projects.isTemplate, true),
          eq(projects.userId, systemUserId)
        )
      )
      .orderBy(desc(projects.updatedAt));

    return c.json({ data });
  })
  .get(
    "/templates/:id",
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const systemUserId = await getSystemUserId();
      const { id } = c.req.valid("param");

      if (!systemUserId) {
        return c.json({ error: "Not found" }, 404);
      }

      const [template] = await db
        .select({
          id: projects.id,
          name: projects.name,
          width: projects.width,
          height: projects.height,
          thumbnailUrl: projects.thumbnailUrl,
          updatedAt: projects.updatedAt,
        })
        .from(projects)
        .where(
          and(
            eq(projects.id, id),
            eq(projects.isTemplate, true),
            eq(projects.userId, systemUserId)
          )
        );

      if (!template) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data: template });
    }
  )
  .get("/assets", async (c) => {
    const systemUserId = await getSystemUserId();

    if (!systemUserId) {
      return c.json({ data: [] });
    }

    const data = await db
      .select({
        id: assets.id,
        name: assets.name,
        url: assets.url,
        type: assets.type,
      })
      .from(assets)
      .where(
        and(
          eq(assets.userId, systemUserId),
          eq(assets.isBuiltin, true)
        )
      )
      .orderBy(desc(assets.createdAt));

    return c.json({ data });
  })
  .get("/settings", async (c) => {
    const settings = await getAppSettings();

    return c.json({
      data: {
        ...settings,
        billingEnabled: isBillingEnabled(),
      },
    });
  })
  .get("/oauth", async (c) => {
    const providers = await getOAuthProviderSettings();
    return c.json({
      data: providers.map((provider) => ({
        provider: provider.provider,
        enabled: provider.enabled,
      })),
    });
  });

export default app;
