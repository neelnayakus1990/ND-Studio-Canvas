import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetSubscription = (enabled = true) => {
  const query = useQuery({
    queryKey: ["subscription"],
    enabled,
    queryFn: async () => {
      const response = await client.api.subscriptions.current.$get();

      if (response.status === 401) {
        return null;
      }

      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      const { data } = await response.json();
      return data; 
    },
    retry: false,
  });

  return query;
};
