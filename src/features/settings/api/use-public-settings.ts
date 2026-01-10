import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export type PublicSettings = {
  freeProjectLimit: number;
  freeTemplateLimit: number;
  freeAllowsAi: boolean;
  freeAllowsBgRemoval: boolean;
  freeAllowsExport: boolean;
  billingEnabled: boolean;
};

export const usePublicSettings = () => {
  return useQuery({
    queryKey: ["public-settings"],
    queryFn: async () => {
      const response = await client.api.public.settings.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }

      const { data } = await response.json();
      return data as PublicSettings;
    },
  });
};
