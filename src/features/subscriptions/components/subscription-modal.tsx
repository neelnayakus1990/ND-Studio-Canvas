"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

import { useCheckout } from "@/features/subscriptions/api/use-checkout";
import { useSubscriptionModal } from "@/features/subscriptions/store/use-subscription-modal";
import { usePublicSettings } from "@/features/settings/api/use-public-settings";

import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export const SubscriptionModal = () => {
  const mutation = useCheckout();
  const { isOpen, onClose } = useSubscriptionModal();
  const { data: settings } = usePublicSettings();

  const proFeatures = [
    settings?.freeProjectLimit !== undefined
      ? `Unlimited projects (free: ${settings.freeProjectLimit})`
      : "Unlimited projects",
    settings?.freeTemplateLimit !== undefined
      ? `Unlimited templates (free: ${settings.freeTemplateLimit})`
      : "Unlimited templates",
    settings?.freeAllowsBgRemoval ? null : "AI Background removal",
    settings?.freeAllowsAi ? null : "AI Image generation",
    settings?.freeAllowsExport ? null : "Export controls",
  ].filter(Boolean) as string[];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="flex items-center space-y-4">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={36}
            height={36}
          />
          <DialogTitle className="text-center">
            Upgrade to a paid plan
          </DialogTitle>
        <DialogDescription className="text-center">
          Upgrade to unlock paid-only features.
        </DialogDescription>
        </DialogHeader>
        <Separator />
        <ul className="space-y-2">
          {proFeatures.map((feature) => (
            <li key={feature} className="flex items-center">
              <CheckCircle2 className="size-5 mr-2 fill-blue-500 text-white" />
              <p className="text-sm text-muted-foreground">
                {feature}
              </p>
            </li>
          ))}
        </ul>
        <DialogFooter className="pt-2 mt-4 gap-y-2">
          <Button
            className="w-full"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || settings?.billingEnabled === false}
          >
            {settings?.billingEnabled === false ? "Billing unavailable" : "Upgrade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
