import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";

export const protectServer = async () => {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }
};

export const requireAdmin = async () => {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  const email = session?.user?.email ?? null;

  if (!isAdminEmail(email)) {
    redirect("/dashboard");
  }
};
