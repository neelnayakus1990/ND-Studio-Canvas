"use client";

import Image from "next/image";
import { useState } from "react";
import { AlertTriangle, Loader, Search } from "lucide-react";

import { builtinAssets } from "@/features/assets/data/builtins";
import { useGetAssets } from "@/features/assets/api/use-get-assets";

import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AssetsSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const AssetsSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: AssetsSidebarProps) => {
  const [tab, setTab] = useState<"builtins" | "mine">("builtins");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"image" | "icon" | "svg" | "">("");

  const { data, isLoading, isError } = useGetAssets({
    search: search || undefined,
    type: type || undefined,
  });

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-[var(--panel1)] relative border-r border-[var(--stroke)] z-[40] w-[360px] h-full flex flex-col",
        activeTool === "assets" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Assets"
        description="Use built-in assets or your uploaded library"
      />
      <div className="px-4 pb-4 space-y-3 border-b border-[var(--stroke)]">
        <div className="flex items-center gap-x-2">
          <Button
            variant="outline"
            className={cn(
              "flex-1 border-[var(--stroke)]",
              tab === "builtins" && "bg-[var(--panel2)]"
            )}
            onClick={() => setTab("builtins")}
          >
            Built-ins
          </Button>
          <Button
            variant="outline"
            className={cn(
              "flex-1 border-[var(--stroke)]",
              tab === "mine" && "bg-[var(--panel2)]"
            )}
            onClick={() => setTab("mine")}
          >
            My Assets
          </Button>
        </div>
        {tab === "mine" && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-text)]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assets"
                className="pl-9 bg-transparent border-[var(--stroke)]"
              />
            </div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className="w-full h-9 rounded-md bg-transparent border border-[var(--stroke)] text-sm px-3"
            >
              <option value="">All types</option>
              <option value="image">Image</option>
              <option value="icon">Icon</option>
              <option value="svg">SVG</option>
            </select>
          </div>
        )}
      </div>

      {tab === "mine" && isLoading && (
        <div className="flex items-center justify-center flex-1">
          <Loader className="size-4 text-[var(--muted-text)] animate-spin" />
        </div>
      )}
      {tab === "mine" && isError && (
        <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
          <AlertTriangle className="size-4 text-[var(--muted-text)]" />
          <p className="text-[var(--muted-text)] text-xs">
            Failed to fetch assets
          </p>
        </div>
      )}

      <ScrollArea>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {tab === "builtins" &&
              builtinAssets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => editor?.addImage(asset.url)}
                  className="relative w-full h-[110px] group hover:opacity-75 transition bg-[var(--panel2)] rounded-md overflow-hidden border border-[var(--stroke)]"
                >
                  <Image
                    fill
                    src={asset.url}
                    alt={asset.name}
                    className="object-contain p-4"
                  />
                </button>
              ))}
            {tab === "mine" &&
              data?.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => editor?.addImage(asset.url)}
                  className="relative w-full h-[110px] group hover:opacity-75 transition bg-[var(--panel2)] rounded-md overflow-hidden border border-[var(--stroke)]"
                >
                  <Image
                    fill
                    src={asset.url}
                    alt={asset.name}
                    className="object-contain p-3"
                  />
                </button>
              ))}
          </div>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
