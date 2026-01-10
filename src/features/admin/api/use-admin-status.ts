import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export type AdminStatus = {
  isAdmin: boolean;
};

export const useAdminStatus = () => {
  return useQuery({
    queryKey: ["admin-status"],
    queryFn: async () => {
      const response = await client.api.admin.me.$get();

      if (!response.ok) {
        return { isAdmin: false } as AdminStatus;
      }

      const { data } = await response.json();
      return data as AdminStatus;
    },
  });
};
