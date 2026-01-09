"use client";

import { useEffect, useState } from "react";
import { Loader, Plus, Save, Trash2 } from "lucide-react";

import { fonts as availableFonts } from "@/features/editor/types";
import { BrandKitData, useGetBrandKit } from "@/features/brand-kit/api/use-get-brand-kit";
import { useSaveBrandKit } from "@/features/brand-kit/api/use-save-brand-kit";

import { UploadButton } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const defaultColors = ["#0F0F10", "#E6C27A", "#EDEDED"];

export default function BrandKitPage() {
  const { data, isLoading } = useGetBrandKit();
  const saveMutation = useSaveBrandKit();

  const [name, setName] = useState("Default Brand Kit");
  const [colors, setColors] = useState<string[]>(defaultColors);
  const [fonts, setFonts] = useState<string[]>(["Inter"]);
  const [logos, setLogos] = useState<{ lightUrl?: string; darkUrl?: string }>({});
  const [watermarkUrl, setWatermarkUrl] = useState<string | null>(null);
  const [handles, setHandles] = useState({
    instagram: "",
    tiktok: "",
    youtube: "",
    website: "",
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    const kit = data as BrandKitData;
    setName(kit.name || "Default Brand Kit");
    setColors(kit.colors || defaultColors);
    setFonts(kit.fonts || ["Inter"]);
    setLogos(kit.logos || {});
    setWatermarkUrl(kit.watermarkUrl || null);
    setHandles({
      instagram: kit.handles?.instagram || "",
      tiktok: kit.handles?.tiktok || "",
      youtube: kit.handles?.youtube || "",
      website: kit.handles?.website || "",
    });
  }, [data]);

  const onSave = () => {
    saveMutation.mutate({
      name,
      colors,
      fonts,
      logos,
      watermarkUrl: watermarkUrl || undefined,
      handles,
    });
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-5 animate-spin text-[var(--muted-text)]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-full mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Brand Kit</h1>
        <p className="text-sm text-[var(--muted-text)]">
          Configure colors, fonts, and logos for consistent design.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Brand kit name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent border-[var(--stroke)]"
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <Label>Palette</Label>
          <div className="flex flex-wrap gap-3">
            {colors.map((color, index) => (
              <div key={`${color}-${index}`} className="flex items-center gap-x-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    const next = [...colors];
                    next[index] = e.target.value;
                    setColors(next);
                  }}
                  className="size-10 rounded-md border border-[var(--stroke)] bg-transparent"
                />
                <Input
                  value={color}
                  onChange={(e) => {
                    const next = [...colors];
                    next[index] = e.target.value;
                    setColors(next);
                  }}
                  className="w-[120px] bg-transparent border-[var(--stroke)]"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setColors(colors.filter((_, i) => i !== index))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              className="border-[var(--stroke)]"
              onClick={() => setColors([...colors, "#E6C27A"])}
            >
              <Plus className="size-4 mr-2" />
              Add color
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Fonts</Label>
          <Textarea
            value={fonts.join(", ")}
            onChange={(e) => {
              const value = e.target.value
                .split(",")
                .map((font) => font.trim())
                .filter(Boolean);
              setFonts(value.length > 0 ? value : ["Inter"]);
            }}
            className="bg-transparent border-[var(--stroke)]"
          />
          <p className="text-xs text-[var(--muted-text)]">
            Suggested: {availableFonts.slice(0, 8).join(", ")}...
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label>Light logo</Label>
            <UploadButton
              appearance={{
                button: "w-full text-sm font-medium",
                allowedContent: "hidden",
              }}
              content={{ button: "Upload light logo" }}
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                setLogos((current) => ({ ...current, lightUrl: res[0].url }));
              }}
            />
            {logos.lightUrl && (
              <Input value={logos.lightUrl} readOnly className="bg-transparent border-[var(--stroke)]" />
            )}
          </div>
          <div className="space-y-3">
            <Label>Dark logo</Label>
            <UploadButton
              appearance={{
                button: "w-full text-sm font-medium",
                allowedContent: "hidden",
              }}
              content={{ button: "Upload dark logo" }}
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                setLogos((current) => ({ ...current, darkUrl: res[0].url }));
              }}
            />
            {logos.darkUrl && (
              <Input value={logos.darkUrl} readOnly className="bg-transparent border-[var(--stroke)]" />
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Watermark</Label>
          <UploadButton
            appearance={{
              button: "w-full text-sm font-medium",
              allowedContent: "hidden",
            }}
            content={{ button: "Upload watermark" }}
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              setWatermarkUrl(res[0].url);
            }}
          />
          {watermarkUrl && (
            <Input value={watermarkUrl} readOnly className="bg-transparent border-[var(--stroke)]" />
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Social handles</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Instagram"
              value={handles.instagram}
              onChange={(e) => setHandles({ ...handles, instagram: e.target.value })}
              className="bg-transparent border-[var(--stroke)]"
            />
            <Input
              placeholder="TikTok"
              value={handles.tiktok}
              onChange={(e) => setHandles({ ...handles, tiktok: e.target.value })}
              className="bg-transparent border-[var(--stroke)]"
            />
            <Input
              placeholder="YouTube"
              value={handles.youtube}
              onChange={(e) => setHandles({ ...handles, youtube: e.target.value })}
              className="bg-transparent border-[var(--stroke)]"
            />
            <Input
              placeholder="Website"
              value={handles.website}
              onChange={(e) => setHandles({ ...handles, website: e.target.value })}
              className="bg-transparent border-[var(--stroke)]"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={onSave}
            disabled={saveMutation.isPending}
            className="bg-[var(--gold)] text-black hover:opacity-90"
          >
            <Save className="size-4 mr-2" />
            Save Brand Kit
          </Button>
        </div>
      </div>
    </div>
  );
}
