import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { validateServerEnv } from "@/lib/env";

validateServerEnv();

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
