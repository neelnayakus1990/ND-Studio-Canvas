import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";
import { useSubscriptionModal } from "@/features/subscriptions/store/use-subscription-modal";

type ResponseType = InferResponseType<typeof client.api.projects[":id"]["duplicate"]["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.projects[":id"]["duplicate"]["$post"]>["param"];

export const useDuplicateProject = () => {
  const queryClient = useQueryClient();
  const subscriptionModal = useSubscriptionModal();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (param) => {
      const response = await client.api.projects[":id"].duplicate.$post({ 
        param,
      });

      if (response.status === 402) {
        subscriptionModal.onOpen();
        throw new Error("Free project limit reached");
      }

      if (!response.ok) {
        throw new Error("Failed to duplicate project");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      toast.error("Failed to duplicate project");
    }
  });

  return mutation;
};
