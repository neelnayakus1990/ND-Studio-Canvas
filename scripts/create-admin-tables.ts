import { sql } from "drizzle-orm";

import { db } from "../src/db/drizzle";

const run = async () => {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "app_settings" (
      "id" text PRIMARY KEY NOT NULL,
      "freeProjectLimit" integer NOT NULL,
      "freeTemplateLimit" integer NOT NULL,
      "freeAllowsAi" boolean DEFAULT false NOT NULL,
      "freeAllowsBgRemoval" boolean DEFAULT false NOT NULL,
      "freeAllowsExport" boolean DEFAULT true NOT NULL,
      "updatedAt" timestamp NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "oauth_provider" (
      "id" text PRIMARY KEY NOT NULL,
      "provider" text NOT NULL,
      "clientId" text,
      "clientSecret" text,
      "enabled" boolean DEFAULT false NOT NULL,
      "updatedAt" timestamp NOT NULL
    );
  `);
};

run()
  .then(() => {
    console.log("Admin tables ensured");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to create admin tables");
    console.error(error);
    process.exit(1);
  });
