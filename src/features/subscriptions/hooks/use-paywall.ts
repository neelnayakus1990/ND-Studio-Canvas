import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { useSubscriptionModal } from "@/features/subscriptions/store/use-subscription-modal";
import { useGetSubscription } from "@/features/subscriptions/api/use-get-subscription";

export const usePaywall = () => {
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isSessionLoading = status === "loading";

  const { 
    data: subscription,
    isLoading: isLoadingSubscription,
  } = useGetSubscription(isAuthenticated);

  const subscriptionModal = useSubscriptionModal();

  const isLoading = isSessionLoading || isLoadingSubscription;
  const shouldBlock = isAuthenticated && !isLoading && !subscription?.active;

  return {
    isLoading,
    shouldBlock,
    isAuthenticated,
    triggerPaywall: () => {
      subscriptionModal.onOpen();
    },
    requireAuth: () => {
      if (!isAuthenticated) {
        router.push("/sign-in");
        return false;
      }
      return true;
    },
  };
};
