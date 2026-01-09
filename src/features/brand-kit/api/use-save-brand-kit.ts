import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api["brand-kits"]["$post"], 200>;
type RequestType = InferRequestType<typeof client.api["brand-kits"]["$post"]>["json"];

export const useSaveBrandKit = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api["brand-kits"].$post({ json });

      if (!response.ok) {
        throw new Error("Failed to save brand kit");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-kit"] });
    },
    onError: () => {
      toast.error("Failed to save brand kit");
    },
  });

  return mutation;
};
