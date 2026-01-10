import { z } from "zod";
import { Hono } from "hono";
import { verifyAuth } from "@hono/auth-js";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";

import { replicate } from "@/lib/replicate";
import { validateServerEnv } from "@/lib/env";
import { db } from "@/db/drizzle";
import { subscriptions } from "@/db/schema";
import { checkIsActive } from "@/features/subscriptions/lib";
import { getAppSettings } from "@/lib/settings";

validateServerEnv({ ai: true });

const canUseAi = async (userId: string, allowFree: boolean) => {
  if (allowFree) {
    return true;
  }

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));

  return checkIsActive(subscription);
};

const app = new Hono()
  .post(
    "/remove-bg",
    verifyAuth(),
    zValidator(
      "json",
      z.object({
        image: z.string(),
      }),
    ),
    async (c) => {
      const auth = c.get("authUser");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const settings = await getAppSettings();
      const allowed = await canUseAi(auth.token.id, settings.freeAllowsBgRemoval);

      if (!allowed) {
        return c.json({ error: "Paid feature" }, 402);
      }

      const { image } = c.req.valid("json");

      const input = {
        image: image
      };
    
      const output: unknown = await replicate.run("cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003", { input });

      const res = output as string;

      return c.json({ data: res });
    },
  )
  .post(
    "/generate-image",
    verifyAuth(),
    zValidator(
      "json",
      z.object({
        prompt: z.string(),
      }),
    ),
    async (c) => {
      const auth = c.get("authUser");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const settings = await getAppSettings();
      const allowed = await canUseAi(auth.token.id, settings.freeAllowsAi);

      if (!allowed) {
        return c.json({ error: "Paid feature" }, 402);
      }

      const { prompt } = c.req.valid("json");

      const input = {
        cfg: 3.5,
        steps: 28,
        prompt: prompt,
        aspect_ratio: "3:2",
        output_format: "webp",
        output_quality: 90,
        negative_prompt: "",
        prompt_strength: 0.85
      };
      
      const output = await replicate.run("stability-ai/stable-diffusion-3", { input });
      
      const res = output as Array<string>;

      return c.json({ data: res[0] });
    },
  );

export default app;
