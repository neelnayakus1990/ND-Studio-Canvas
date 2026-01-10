import { redirect } from "next/navigation";

import { SignInCard } from "@/features/auth/components/sign-in-card";

import { auth } from "@/auth";

const getSafeCallbackUrl = (callbackUrl?: string) => {
  if (!callbackUrl) {
    return "/dashboard";
  }

  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return "/dashboard";
  }

  return callbackUrl;
};

interface SignInPageProps {
  searchParams?: {
    callbackUrl?: string;
  };
}

const SignInPage = async ({ searchParams }: SignInPageProps) => {
  const session = await auth();

  if (session) {
    redirect(getSafeCallbackUrl(searchParams?.callbackUrl));
  }

  return <SignInCard />;
};

export default SignInPage;
