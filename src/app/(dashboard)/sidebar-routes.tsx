"use client";

import { 
  CreditCard, 
  Crown, 
  Home, 
  MessageCircleQuestion,
  Palette,
  LayoutTemplate,
  Shield
} from "lucide-react";
import { usePathname } from "next/navigation";

import { usePaywall } from "@/features/subscriptions/hooks/use-paywall";
import { useCheckout } from "@/features/subscriptions/api/use-checkout";
import { useBilling } from "@/features/subscriptions/api/use-billing";
import { useAdminStatus } from "@/features/admin/api/use-admin-status";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { SidebarItem } from "./sidebar-item";

export const SidebarRoutes = () => {
  const mutation = useCheckout();
  const billingMutation = useBilling();
  const { shouldBlock, isLoading, triggerPaywall } = usePaywall();
  const { data: adminStatus } = useAdminStatus();

  const pathname = usePathname();

  const onClick = () => {
    if (shouldBlock) {
      triggerPaywall();
      return;
    }

    billingMutation.mutate();
  };

  return (
    <div className="flex flex-col gap-y-4 flex-1">
      {shouldBlock && !isLoading && (
        <>
          <div className="px-3">
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel2)] hover:opacity-75 transition"
              variant="outline"
              size="lg"
            >
              <Crown className="mr-2 size-4 fill-[var(--gold)] text-[var(--gold)]" />
              Upgrade to Image AI Pro
            </Button>
          </div>
          <div className="px-3">
            <Separator />
          </div>
        </>
      )}
      <ul className="flex flex-col gap-y-1 px-3">
        <SidebarItem
          href="/dashboard"
          icon={Home}
          label="Home"
          isActive={pathname === "/dashboard"}
        />
        <SidebarItem
          href="/dashboard/templates"
          icon={LayoutTemplate}
          label="Templates"
          isActive={pathname === "/dashboard/templates"}
        />
        <SidebarItem
          href="/brand-kit"
          icon={Palette}
          label="Brand Kit"
          isActive={pathname === "/brand-kit"}
        />
        {adminStatus?.isAdmin && (
          <SidebarItem
            href="/dashboard/admin"
            icon={Shield}
            label="Admin"
            isActive={pathname === "/dashboard/admin"}
          />
        )}
      </ul>
      <div className="px-3">
        <Separator />
      </div>
      <ul className="flex flex-col gap-y-1 px-3">
        <SidebarItem
          href={pathname}
          icon={CreditCard}
          label="Billing"
          onClick={onClick}
        />
        <SidebarItem
          href="mailto:support@codewithantonio.com"
          icon={MessageCircleQuestion}
          label="Get Help"
        />
      </ul>
    </div>
  );
};
