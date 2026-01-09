import { z } from "zod";
import { Hono } from "hono";
import { eq, and, desc, asc, count, or, isNull } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";
import { zValidator } from "@hono/zod-validator";

import { db } from "@/db/drizzle";
import { projects, projectsInsertSchema, subscriptions } from "@/db/schema";
import { checkIsActive } from "@/features/subscriptions/lib";
import { FREE_PROJECT_LIMIT, FREE_TEMPLATE_LIMIT } from "@/lib/free-tier";

const getIsPro = async (userId: string) => {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));

  return checkIsActive(subscription);
};

const canCreateProject = async (userId: string) => {
  const isPro = await getIsPro(userId);

  if (isPro) {
    return true;
  }

  const [{ count: projectCount }] = await db
    .select({ count: count() })
    .from(projects)
    .where(
      and(
        eq(projects.userId, userId),
        or(eq(projects.isTemplate, false), isNull(projects.isTemplate))
      )
    );

  return Number(projectCount) < FREE_PROJECT_LIMIT;
};

const canCreateTemplate = async (userId: string) => {
  const isPro = await getIsPro(userId);

  if (isPro) {
    return true;
  }

  const baseQuery = db
    .select({ count: count() })
    .from(projects)
    .where(
      and(
        eq(projects.userId, userId),
        eq(projects.isTemplate, true)
      )
    );

  const [{ count: templateCount }] = await baseQuery;

  return Number(templateCount) < FREE_TEMPLATE_LIMIT;
};

const app = new Hono()
  .get(
    "/templates",
    verifyAuth(),
    zValidator(
      "query",
      z.object({
        page: z.coerce.number(),
        limit: z.coerce.number(),
      }),
    ),
    async (c) => {
      const { page, limit } = c.req.valid("query");

      const data = await db
        .select()
        .from(projects)
        .where(eq(projects.isTemplate, true))
        .limit(limit)
        .offset((page -1) * limit)
        .orderBy(
          asc(projects.isPro),
          desc(projects.updatedAt),
        );

      return c.json({ data });
    },
  )
  .delete(
    "/:id",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const data = await db
        .delete(projects)
        .where(
          and(
            eq(projects.id, id),
            eq(projects.userId, auth.token.id),
          ),
        )
        .returning();

      if (data.length === 0) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data: { id } });
    },
  )
  .post(
    "/:id/duplicate",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const canCreate = await canCreateProject(auth.token.id);

      if (!canCreate) {
        return c.json({ error: "Free project limit reached" }, 402);
      }

      const data = await db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.id, id),
            eq(projects.userId, auth.token.id),
          ),
        );

      if (data.length === 0) {
        return c.json({ error:" Not found" }, 404);
      }

      const project = data[0];

      const duplicateData = await db
        .insert(projects)
        .values({
          name: `Copy of ${project.name}`,
          json: project.json,
          width: project.width,
          height: project.height,
          userId: auth.token.id,
          isTemplate: false,
          isPro: project.isPro ?? false,
          thumbnailUrl: project.thumbnailUrl ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return c.json({ data: duplicateData[0] });
    },
  )
  .post(
    "/templates/:id/use",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const canCreate = await canCreateProject(auth.token.id);

      if (!canCreate) {
        return c.json({ error: "Free project limit reached" }, 402);
      }

      const data = await db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.id, id),
            eq(projects.isTemplate, true),
          ),
        );

      if (data.length === 0) {
        return c.json({ error: "Not found" }, 404);
      }

      const template = data[0];

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
  )
  .get(
    "/",
    verifyAuth(),
    zValidator(
      "query",
      z.object({
        page: z.coerce.number(),
        limit: z.coerce.number(),
      }),
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { page, limit } = c.req.valid("query");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const data = await db
        .select()
        .from(projects)
        .where(eq(projects.userId, auth.token.id))
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy(desc(projects.updatedAt))

      return c.json({
        data,
        nextPage: data.length === limit ? page + 1 : null,
      });
    },
  )
  .patch(
    "/:id",
    verifyAuth(),
    zValidator(
      "param",
      z.object({ id: z.string() }),
    ),
    zValidator(
      "json",
      projectsInsertSchema
        .omit({
          id: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        })
        .partial()
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (values.isTemplate === true) {
        const [current] = await db
          .select()
          .from(projects)
          .where(
            and(
              eq(projects.id, id),
              eq(projects.userId, auth.token.id)
            )
          );

        if (!current) {
          return c.json({ error: "Not found" }, 404);
        }

        if (!current.isTemplate) {
          const canCreate = await canCreateTemplate(auth.token.id);

          if (!canCreate) {
            return c.json({ error: "Free template limit reached" }, 402);
          }
        }
      }

      const data = await db
        .update(projects)
        .set({
          ...values,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(projects.id, id),
            eq(projects.userId, auth.token.id),
          ),
        )
        .returning();

      if (data.length === 0) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      return c.json({ data: data[0] });
    },
  )
  .get(
    "/:id",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const data = await db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.id, id),
            eq(projects.userId, auth.token.id)
          )
        );

      if (data.length === 0) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data: data[0] });
    },
  )
  .post(
    "/",
    verifyAuth(),
    zValidator(
      "json",
      projectsInsertSchema.pick({
        name: true,
        json: true,
        width: true,
        height: true,
      }),
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { name, json, height, width } = c.req.valid("json");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const canCreate = await canCreateProject(auth.token.id);

      if (!canCreate) {
        return c.json({ error: "Free project limit reached" }, 402);
      }

      const data = await db
        .insert(projects)
        .values({
          name,
          json,
          width,
          height,
          userId: auth.token.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (!data[0]) {
        return c.json({ error: "Something went wrong" }, 400);
      }

      return c.json({ data: data[0] });
    },
  );

export default app;
