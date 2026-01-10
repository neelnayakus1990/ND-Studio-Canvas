import { redirect } from "next/navigation";

import { SignUpCard } from "@/features/auth/components/sign-up-card";

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

interface SignUpPageProps {
  searchParams?: {
    callbackUrl?: string;
  };
}

const SignUpPage = async ({ searchParams }: SignUpPageProps) => {
  const session = await auth();

  if (session) {
    redirect(getSafeCallbackUrl(searchParams?.callbackUrl));
  }

  return <SignUpCard />;
};

export default SignUpPage;
