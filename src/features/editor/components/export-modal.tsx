"use client";

import { useState } from "react";

import { Editor } from "@/features/editor/types";
import { usePaywall } from "@/features/subscriptions/hooks/use-paywall";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ExportModalProps {
  editor: Editor | undefined;
  open: boolean;
  onClose: () => void;
}

export const ExportModal = ({ editor, open, onClose }: ExportModalProps) => {
  const { shouldBlock, triggerPaywall, settings } = usePaywall();
  const [format, setFormat] = useState<"png" | "jpg">("png");
  const [scale, setScale] = useState(1);
  const [transparent, setTransparent] = useState(false);

  const onExport = () => {
    if (shouldBlock && !settings?.freeAllowsExport) {
      triggerPaywall();
      return;
    }

    editor?.exportImage({
      format,
      scale,
      transparent,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export</DialogTitle>
          <DialogDescription>
            Choose a format and scale for your export.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className={format === "png" ? "bg-[var(--panel2)] border-[var(--stroke)]" : "border-[var(--stroke)]"}
              onClick={() => setFormat("png")}
            >
              PNG
            </Button>
            <Button
              variant="outline"
              className={format === "jpg" ? "bg-[var(--panel2)] border-[var(--stroke)]" : "border-[var(--stroke)]"}
              onClick={() => setFormat("jpg")}
            >
              JPG
            </Button>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((value) => (
              <Button
                key={value}
                variant="outline"
                className={scale === value ? "bg-[var(--panel2)] border-[var(--stroke)]" : "border-[var(--stroke)]"}
                onClick={() => setScale(value)}
              >
                {value}x
              </Button>
            ))}
          </div>
          {format === "png" && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={transparent}
                onChange={(e) => setTransparent(e.target.checked)}
                className="size-4"
              />
              Transparent background
            </label>
          )}
        </div>
        <DialogFooter className="gap-y-2">
          <Button
            variant="outline"
            className="border-[var(--stroke)]"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="bg-[var(--gold)] text-black hover:opacity-90"
            onClick={onExport}
          >
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
