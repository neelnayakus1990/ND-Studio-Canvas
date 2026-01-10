import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { users } from "@/db/schema";

export const getSystemUserId = async () => {
  const email = process.env.SYSTEM_USER_EMAIL;

  if (!email) {
    return null;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  return user?.id ?? null;
};
