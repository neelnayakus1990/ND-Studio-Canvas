import { z } from "zod";
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";
import { zValidator } from "@hono/zod-validator";

import { db } from "@/db/drizzle";
import { brandKits } from "@/db/schema";

const brandKitSchema = z.object({
  name: z.string().min(1),
  colors: z.array(z.string()),
  fonts: z.array(z.string()),
  logos: z.object({
    lightUrl: z.string().url().optional(),
    darkUrl: z.string().url().optional(),
  }),
  watermarkUrl: z.string().url().optional().nullable(),
  handles: z.object({
    instagram: z.string().optional(),
    tiktok: z.string().optional(),
    youtube: z.string().optional(),
    website: z.string().optional(),
  }),
});

const app = new Hono()
  .get("/current", verifyAuth(), async (c) => {
    const auth = c.get("authUser");

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [data] = await db
      .select()
      .from(brandKits)
      .where(eq(brandKits.userId, auth.token.id));

    return c.json({ data: data ?? null });
  })
  .post(
    "/",
    verifyAuth(),
    zValidator("json", brandKitSchema),
    async (c) => {
      const auth = c.get("authUser");
      const values = c.req.valid("json");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const now = new Date();

      const [existing] = await db
        .select()
        .from(brandKits)
        .where(eq(brandKits.userId, auth.token.id));

      if (existing) {
        const [data] = await db
          .update(brandKits)
          .set({
            ...values,
            updatedAt: now,
          })
          .where(eq(brandKits.userId, auth.token.id))
          .returning();

        return c.json({ data });
      }

      const [data] = await db
        .insert(brandKits)
        .values({
          ...values,
          userId: auth.token.id,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return c.json({ data });
    }
  );

export default app;
