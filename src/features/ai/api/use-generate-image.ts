import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/hono";
import { useSubscriptionModal } from "@/features/subscriptions/store/use-subscription-modal";

type ResponseType = string;
type RequestType = InferRequestType<typeof client.api.ai["generate-image"]["$post"]>["json"];

export const useGenerateImage = () => {
  const subscriptionModal = useSubscriptionModal();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.ai["generate-image"].$post({ json });

      if (response.status === 402) {
        subscriptionModal.onOpen();
        throw new Error("Paid feature");
      }

      const body = (await response.json()) as { data?: string };
      if (!body.data) {
        throw new Error("Failed to generate image");
      }
      return body.data;
    },
  });

  return mutation;
};
