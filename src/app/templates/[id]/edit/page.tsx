"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSubscriptionModal } from "@/features/subscriptions/store/use-subscription-modal";

interface TemplateEditPageProps {
  params: {
    id: string;
  };
}

export default function TemplateEditPage({ params }: TemplateEditPageProps) {
  const router = useRouter();
  const subscriptionModal = useSubscriptionModal();

  useEffect(() => {
    const run = async () => {
      const response = await fetch(`/api/templates/${params.id}/use`, {
        method: "POST",
      });

      if (response.status === 401) {
        const callbackUrl = `/templates/${params.id}/edit`;
        router.replace(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        return;
      }

      if (response.status === 402) {
        subscriptionModal.onOpen();
        return;
      }

      if (!response.ok) {
        router.replace("/templates");
        return;
      }

      const { data } = await response.json();
      router.replace(`/editor/${data.id}`);
    };

    run();
  }, [params.id, router, subscriptionModal]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-foreground">
      <p className="text-sm text-[var(--muted-text)]">
        Preparing your template...
      </p>
    </div>
  );
}
