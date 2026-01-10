import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export type AdminSettingsPayload = {
  freeProjectLimit: number;
  freeTemplateLimit: number;
  freeAllowsAi: boolean;
  freeAllowsBgRemoval: boolean;
  freeAllowsExport: boolean;
};

export const useAdminSettings = () => {
  return useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const response = await client.api.admin.settings.$get();

      if (!response.ok) {
        throw new Error("Failed to load settings");
      }

      const { data } = await response.json();
      return data as AdminSettingsPayload;
    },
  });
};

export const useUpdateAdminSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AdminSettingsPayload) => {
      const response = await client.api.admin.settings.$patch({
        json: payload,
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      const { data } = await response.json();
      return data as AdminSettingsPayload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["public-settings"] });
    },
  });
};
