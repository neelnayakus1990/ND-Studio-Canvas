import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.projects.templates[":id"]["use"]["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.projects.templates[":id"]["use"]["$post"]>["param"];

export const useUseTemplate = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (param) => {
      const response = await client.api.projects.templates[":id"].use.$post({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to use template");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      toast.error("Failed to use template");
    },
  });

  return mutation;
};
