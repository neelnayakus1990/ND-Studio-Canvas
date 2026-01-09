import { z } from "zod";
import { Hono } from "hono";
import { and, desc, eq, ilike } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";
import { zValidator } from "@hono/zod-validator";

import { db } from "@/db/drizzle";
import { assets } from "@/db/schema";

const app = new Hono()
  .get(
    "/",
    verifyAuth(),
    zValidator(
      "query",
      z.object({
        type: z.enum(["image", "icon", "svg"]).optional(),
        search: z.string().optional(),
      })
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { type, search } = c.req.valid("query");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const conditions = [eq(assets.userId, auth.token.id)];

      if (type) {
        conditions.push(eq(assets.type, type));
      }

      if (search) {
        conditions.push(ilike(assets.name, `%${search}%`));
      }

      const whereClause =
        conditions.length === 1 ? conditions[0] : and(...conditions);

      const data = await db
        .select()
        .from(assets)
        .where(whereClause)
        .orderBy(desc(assets.createdAt));

      return c.json({ data });
    }
  )
  .post(
    "/",
    verifyAuth(),
    zValidator(
      "json",
      z.object({
        name: z.string().min(1),
        url: z.string().url(),
        type: z.enum(["image", "icon", "svg"]),
        tags: z.array(z.string()).optional(),
      })
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { name, url, type, tags } = c.req.valid("json");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .insert(assets)
        .values({
          name,
          url,
          type,
          tags: tags ?? [],
          userId: auth.token.id,
          isBuiltin: false,
          createdAt: new Date(),
        })
        .returning();

      return c.json({ data });
    }
  );

export default app;
