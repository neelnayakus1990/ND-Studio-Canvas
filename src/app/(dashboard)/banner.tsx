"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

import { useCreateProject } from "@/features/projects/api/use-create-project";

import { Button } from "@/components/ui/button";

export const Banner = () => {
  const router = useRouter();
  const mutation = useCreateProject();

  const onClick = () => {
    mutation.mutate(
      {
        name: "Untitled project",
        json: "",
        width: 900,
        height: 1200,
      },
      {
        onSuccess: ({ data }) => {
          router.push(`/editor/${data.id}`);
        },
      },
    );
  };

  return (
    <div className="text-foreground aspect-[5/1] min-h-[248px] flex gap-x-6 p-6 items-center rounded-[var(--r2)] bg-[var(--panel2)] border border-[var(--stroke)]">
      <div className="rounded-full size-28 items-center justify-center bg-[var(--panel1)] border border-[var(--stroke)] hidden md:flex">
        <div className="rounded-full size-20 flex items-center justify-center bg-[var(--panel2)]">
          <Sparkles className="h-16 text-[var(--gold)] fill-[var(--gold)]" />
        </div>
      </div>
      <div className="flex flex-col gap-y-2">
        <h1 className="text-xl md:text-3xl font-semibold">
          Visualize your ideas with Image AI
        </h1>
        <p className="text-xs md:text-sm mb-2">
          Turn inspiration into design in no time. Simply upload an image and let AI do the rest.
        </p>
        <Button
          disabled={mutation.isPending}
          onClick={onClick}
          className="w-[180px] bg-[var(--grad-gold)] text-black hover:opacity-90"
        >
          Start creating
          <ArrowRight className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
