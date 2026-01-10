import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { useSubscriptionModal } from "@/features/subscriptions/store/use-subscription-modal";
import { useGetSubscription } from "@/features/subscriptions/api/use-get-subscription";
import { usePublicSettings } from "@/features/settings/api/use-public-settings";
import { toast } from "sonner";

export const usePaywall = () => {
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isSessionLoading = status === "loading";

  const {
    data: settings,
    isLoading: isLoadingSettings,
  } = usePublicSettings();
  const billingEnabled = settings?.billingEnabled ?? false;

  const { 
    data: subscription,
    isLoading: isLoadingSubscription,
  } = useGetSubscription(isAuthenticated && billingEnabled);

  const subscriptionModal = useSubscriptionModal();

  const isLoading = isSessionLoading || isLoadingSubscription || isLoadingSettings;
  const shouldBlock = isAuthenticated && !isLoading && !subscription?.active;

  return {
    isLoading,
    shouldBlock,
    isAuthenticated,
    settings,
    triggerPaywall: () => {
      if (!billingEnabled) {
        toast.error("Billing is not configured yet.");
        return;
      }
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
