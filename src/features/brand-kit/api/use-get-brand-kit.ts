import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";

import { client } from "@/lib/hono";

export type ResponseType = InferResponseType<typeof client.api["brand-kits"]["current"]["$get"], 200>;

export type BrandKitData = {
  id: string;
  name: string;
  colors: string[];
  fonts: string[];
  logos: {
    lightUrl?: string;
    darkUrl?: string;
  };
  watermarkUrl?: string | null;
  handles: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    website?: string;
  };
};

export const useGetBrandKit = () => {
  const query = useQuery({
    queryKey: ["brand-kit"],
    queryFn: async () => {
      const response = await client.api["brand-kits"].current.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch brand kit");
      }

      const { data } = (await response.json()) as {
        data: BrandKitData | null;
      };
      return data;
    },
  });

  return query;
};
