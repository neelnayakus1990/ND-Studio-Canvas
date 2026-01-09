"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader, Sparkles } from "lucide-react";

import { useGetTemplates } from "@/features/projects/api/use-get-templates";
import { useUseTemplate } from "@/features/projects/api/use-use-template";

import { Button } from "@/components/ui/button";

export default function TemplatesPage() {
  const router = useRouter();
  const useTemplate = useUseTemplate();

  const { data, isLoading, isError } = useGetTemplates({
    page: "1",
    limit: "40",
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-5 animate-spin text-[var(--muted-text)]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-y-2">
        <p className="text-sm text-[var(--muted-text)]">
          Failed to load templates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Templates</h1>
        <p className="text-sm text-[var(--muted-text)]">
          Start from a curated layout or build from scratch.
        </p>
      </div>

      {(!data || data.length === 0) && (
        <div className="flex flex-col items-center justify-center gap-y-3 border border-[var(--stroke)] rounded-[var(--r2)] p-8 bg-[var(--panel2)]">
          <Sparkles className="size-5 text-[var(--gold)]" />
          <p className="text-sm text-[var(--muted-text)]">
            No templates available yet.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {data?.map((template) => (
          <div
            key={template.id}
            className="bg-[var(--panel2)] border border-[var(--stroke)] rounded-[var(--r2)] overflow-hidden"
          >
            <div className="relative w-full aspect-[4/5] bg-black/40">
              {template.thumbnailUrl ? (
                <Image
                  src={template.thumbnailUrl}
                  alt={template.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--muted-text)]">
                  No preview
                </div>
              )}
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-sm font-medium">{template.name}</p>
                <p className="text-xs text-[var(--muted-text)]">
                  {template.width} x {template.height}
                </p>
              </div>
              <Button
                onClick={() =>
                  useTemplate.mutate(
                    { id: template.id },
                    {
                      onSuccess: ({ data }) => {
                        router.push(`/editor/${data.id}`);
                      },
                    }
                  )
                }
                disabled={useTemplate.isPending}
                className="w-full bg-[var(--gold)] text-black hover:opacity-90"
              >
                Use Template
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
