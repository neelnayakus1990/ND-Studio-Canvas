import { Minimize, ZoomIn, ZoomOut } from "lucide-react";

import { Editor } from "@/features/editor/types";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";

interface FooterProps {
  editor: Editor | undefined;
};

export const Footer = ({ editor }: FooterProps) => {
  return (
    <footer className="h-[52px] border-t border-[var(--stroke)] bg-[var(--panel1)] w-full flex items-center overflow-x-auto z-[49] p-2 gap-x-2 shrink-0 px-4 flex-row-reverse">
      <Hint label="Reset" side="top" sideOffset={10}>
        <Button
          onClick={() => editor?.autoZoom()}
          size="icon"
          variant="ghost"
          className="h-full"
        >
          <Minimize className="size-4" />
        </Button>
      </Hint>
      <div className="w-[160px]">
        <input
          type="range"
          min={0.2}
          max={1}
          step={0.05}
          value={editor?.getZoom() || 1}
          onChange={(e) => editor?.setZoom(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
      <Hint label="Zoom in" side="top" sideOffset={10}>
        <Button
          onClick={() => editor?.zoomIn()}
          size="icon"
          variant="ghost"
          className="h-full"
        >
          <ZoomIn className="size-4" />
        </Button>
      </Hint>
      <Hint label="Zoom out" side="top" sideOffset={10}>
        <Button
          onClick={() => editor?.zoomOut()}
          size="icon"
          variant="ghost"
          className="h-full"
        >
          <ZoomOut className="size-4" />
        </Button>
      </Hint>
    </footer>
  );
};
