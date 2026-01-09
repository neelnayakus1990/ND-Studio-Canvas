import { useQuery } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/hono";

export type ResponseType = InferResponseType<typeof client.api.assets.$get, 200>;
type RequestType = InferRequestType<typeof client.api.assets.$get>["query"];

export const useGetAssets = (query: RequestType) => {
  const request = useQuery({
    queryKey: ["assets", query],
    queryFn: async () => {
      const response = await client.api.assets.$get({ query });

      if (!response.ok) {
        throw new Error("Failed to fetch assets");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return request;
};
