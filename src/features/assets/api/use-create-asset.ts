import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.assets.$post, 200>;
type RequestType = InferRequestType<typeof client.api.assets.$post>["json"];

export const useCreateAsset = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.assets.$post({ json });

      if (!response.ok) {
        throw new Error("Failed to create asset");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: () => {
      toast.error("Failed to save asset");
    },
  });

  return mutation;
};
