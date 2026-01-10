import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export type AdminOAuthProvider = {
  provider: "github" | "google";
  enabled: boolean;
  clientId: string | null;
  hasSecret: boolean;
};

export type UpdateOAuthProviderPayload = {
  provider: "github" | "google";
  enabled: boolean;
  clientId?: string;
  clientSecret?: string;
};

export const useAdminOAuthProviders = () => {
  return useQuery({
    queryKey: ["admin-oauth"],
    queryFn: async () => {
      const response = await client.api.admin.oauth.$get();

      if (!response.ok) {
        throw new Error("Failed to load OAuth providers");
      }

      const { data } = await response.json();
      return data as AdminOAuthProvider[];
    },
  });
};

export const useUpdateOAuthProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateOAuthProviderPayload) => {
      const response = await client.api.admin.oauth.$put({
        json: payload,
      });

      if (!response.ok) {
        throw new Error("Failed to update OAuth provider");
      }

      const { data } = await response.json();
      return data as AdminOAuthProvider;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-oauth"] });
      queryClient.invalidateQueries({ queryKey: ["public-oauth"] });
    },
  });
};
