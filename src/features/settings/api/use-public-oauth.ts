import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export type PublicOAuthProvider = {
  provider: string;
  enabled: boolean;
};

export const usePublicOAuthProviders = () => {
  return useQuery({
    queryKey: ["public-oauth"],
    queryFn: async () => {
      const response = await client.api.public.oauth.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch OAuth providers");
      }

      const { data } = await response.json();
      return data as PublicOAuthProvider[];
    },
  });
};
