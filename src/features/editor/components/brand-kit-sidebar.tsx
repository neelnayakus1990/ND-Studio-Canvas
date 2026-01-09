"use client";

import Link from "next/link";
import { AlertTriangle, Loader, Palette } from "lucide-react";

import { useGetBrandKit } from "@/features/brand-kit/api/use-get-brand-kit";

import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BrandKitSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const BrandKitSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: BrandKitSidebarProps) => {
  const { data, isLoading, isError } = useGetBrandKit();

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-[var(--panel1)] relative border-r border-[var(--stroke)] z-[40] w-[360px] h-full flex flex-col",
        activeTool === "brand-kit" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Brand Kit"
        description="Apply colors, fonts, and logos to your design"
      />

      {isLoading && (
        <div className="flex items-center justify-center flex-1">
          <Loader className="size-4 text-[var(--muted-text)] animate-spin" />
        </div>
      )}

      {isError && (
        <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
          <AlertTriangle className="size-4 text-[var(--muted-text)]" />
          <p className="text-[var(--muted-text)] text-xs">
            Failed to fetch brand kit
          </p>
        </div>
      )}

      {!isLoading && !isError && !data && (
        <div className="flex flex-col gap-y-3 items-center justify-center flex-1 text-center px-6">
          <Palette className="size-6 text-[var(--gold)]" />
          <p className="text-sm text-[var(--muted-text)]">
            No brand kit yet. Create one to apply your colors and logos.
          </p>
          <Button asChild className="bg-[var(--gold)] text-black hover:opacity-90">
            <Link href="/brand-kit">Create Brand Kit</Link>
          </Button>
        </div>
      )}

      {data && (
        <div className="p-4 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-[var(--muted-text)]">
              Palette
            </p>
            <div className="flex flex-wrap gap-2">
              {(data.colors as string[]).map((color, index) => (
                <button
                  key={`${color}-${index}`}
                  className="size-9 rounded-md border border-[var(--stroke)]"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    editor?.changeFillColor(color);
                    editor?.changeStrokeColor(color);
                  }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-[var(--muted-text)]">
              Logos
            </p>
            <div className="flex flex-col gap-2">
              {data.logos?.lightUrl && (
                (() => {
                  const lightUrl = data.logos?.lightUrl;
                  if (!lightUrl) return null;
                  return (
                <Button
                  variant="outline"
                  className="border-[var(--stroke)]"
                  onClick={() => editor?.addImage(lightUrl)}
                >
                  Insert light logo
                </Button>
                  );
                })()
              )}
              {data.logos?.darkUrl && (
                (() => {
                  const darkUrl = data.logos?.darkUrl;
                  if (!darkUrl) return null;
                  return (
                <Button
                  variant="outline"
                  className="border-[var(--stroke)]"
                  onClick={() => editor?.addImage(darkUrl)}
                >
                  Insert dark logo
                </Button>
                  );
                })()
              )}
              {data.watermarkUrl && (
                (() => {
                  const watermarkUrl = data.watermarkUrl;
                  if (!watermarkUrl) return null;
                  return (
                <Button
                  variant="outline"
                  className="border-[var(--stroke)]"
                  onClick={() => editor?.addImage(watermarkUrl)}
                >
                  Insert watermark
                </Button>
                  );
                })()
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-[var(--muted-text)]">
              Apply kit
            </p>
            <Button
              className="w-full bg-[var(--gold)] text-black hover:opacity-90"
              onClick={() =>
                editor?.applyBrandKit({
                  colors: (data.colors as string[]) || [],
                  fonts: (data.fonts as string[]) || [],
                  logos: data.logos as { lightUrl?: string; darkUrl?: string },
                })
              }
            >
              Apply Brand Kit to Canvas
            </Button>
          </div>
        </div>
      )}

      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
