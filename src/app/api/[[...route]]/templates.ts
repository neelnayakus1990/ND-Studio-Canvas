import { z } from "zod";
import { Hono } from "hono";
import { and, count, eq, isNull, or } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";
import { zValidator } from "@hono/zod-validator";

import { db } from "@/db/drizzle";
import { projects, subscriptions } from "@/db/schema";
import { checkIsActive } from "@/features/subscriptions/lib";
import { FREE_PROJECT_LIMIT } from "@/lib/free-tier";
import { getSystemUserId } from "@/lib/system-user";

const app = new Hono().post(
  "/:id/use",
  verifyAuth(),
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const auth = c.get("authUser");
    const { id } = c.req.valid("param");

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const systemUserId = await getSystemUserId();

    if (!systemUserId) {
      return c.json({ error: "Not found" }, 404);
    }

    const [template] = await db
      .select()
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

    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, auth.token.id));

    const isPro = checkIsActive(subscription);

    if (!isPro) {
      const [{ count: projectCount }] = await db
        .select({ count: count() })
        .from(projects)
        .where(
          and(
            eq(projects.userId, auth.token.id),
            or(eq(projects.isTemplate, false), isNull(projects.isTemplate))
          )
        );

      if (Number(projectCount) >= FREE_PROJECT_LIMIT) {
        return c.json({ error: "Free project limit reached" }, 402);
      }
    }

    const [newProject] = await db
      .insert(projects)
      .values({
        name: template.name,
        json: template.json,
        width: template.width,
        height: template.height,
        userId: auth.token.id,
        isTemplate: false,
        isPro: template.isPro ?? false,
        thumbnailUrl: template.thumbnailUrl ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return c.json({ data: newProject });
  },
);

export default app;
