"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  useAdminSettings,
  useUpdateAdminSettings,
} from "@/features/admin/api/use-admin-settings";
import {
  useAdminOAuthProviders,
  useUpdateOAuthProvider,
} from "@/features/admin/api/use-admin-oauth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function AdminPage() {
  const settingsQuery = useAdminSettings();
  const updateSettings = useUpdateAdminSettings();
  const oauthQuery = useAdminOAuthProviders();
  const updateOAuth = useUpdateOAuthProvider();

  const [freeProjectLimit, setFreeProjectLimit] = useState(3);
  const [freeTemplateLimit, setFreeTemplateLimit] = useState(3);
  const [freeAllowsAi, setFreeAllowsAi] = useState(false);
  const [freeAllowsBgRemoval, setFreeAllowsBgRemoval] = useState(false);
  const [freeAllowsExport, setFreeAllowsExport] = useState(true);

  const [oauthState, setOauthState] = useState<Record<string, {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
  }>>({});

  useEffect(() => {
    if (!settingsQuery.data) {
      return;
    }

    setFreeProjectLimit(settingsQuery.data.freeProjectLimit);
    setFreeTemplateLimit(settingsQuery.data.freeTemplateLimit);
    setFreeAllowsAi(settingsQuery.data.freeAllowsAi);
    setFreeAllowsBgRemoval(settingsQuery.data.freeAllowsBgRemoval);
    setFreeAllowsExport(settingsQuery.data.freeAllowsExport);
  }, [settingsQuery.data]);

  useEffect(() => {
    if (!oauthQuery.data) {
      return;
    }

    const nextState: Record<string, {
      enabled: boolean;
      clientId: string;
      clientSecret: string;
    }> = {};

    oauthQuery.data.forEach((provider) => {
      nextState[provider.provider] = {
        enabled: provider.enabled,
        clientId: provider.clientId ?? "",
        clientSecret: "",
      };
    });

    setOauthState(nextState);
  }, [oauthQuery.data]);

  const isSaving = updateSettings.isPending || updateOAuth.isPending;

  const onSaveSettings = () => {
    updateSettings.mutate(
      {
        freeProjectLimit,
        freeTemplateLimit,
        freeAllowsAi,
        freeAllowsBgRemoval,
        freeAllowsExport,
      },
      {
        onSuccess: () => {
          toast.success("Settings updated");
        },
        onError: () => {
          toast.error("Failed to update settings");
        },
      }
    );
  };

  const providerCards = useMemo(() => {
    return (oauthQuery.data ?? []).map((provider) => {
      const state = oauthState[provider.provider] ?? {
        enabled: provider.enabled,
        clientId: provider.clientId ?? "",
        clientSecret: "",
      };

      const onUpdate = () => {
        updateOAuth.mutate(
          {
            provider: provider.provider,
            enabled: state.enabled,
            clientId: state.clientId || undefined,
            clientSecret: state.clientSecret || undefined,
          },
          {
            onSuccess: () => {
              toast.success(`${provider.provider} updated`);
              setOauthState((prev) => ({
                ...prev,
                [provider.provider]: {
                  ...prev[provider.provider],
                  clientSecret: "",
                },
              }));
            },
            onError: () => {
              toast.error(`Failed to update ${provider.provider}`);
            },
          }
        );
      };

      return (
        <div
          key={provider.provider}
          className="border border-[var(--stroke)] rounded-[var(--r2)] p-4 bg-[var(--panel2)] space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold capitalize">
                {provider.provider}
              </h3>
              <p className="text-xs text-[var(--muted-text)]">
                {provider.hasSecret ? "Secret stored" : "No secret stored"}
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={state.enabled}
                onChange={(e) =>
                  setOauthState((prev) => ({
                    ...prev,
                    [provider.provider]: {
                      ...prev[provider.provider],
                      enabled: e.target.checked,
                    },
                  }))
                }
                className="size-4"
              />
              Enabled
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              value={state.clientId}
              onChange={(e) =>
                setOauthState((prev) => ({
                  ...prev,
                  [provider.provider]: {
                    ...prev[provider.provider],
                    clientId: e.target.value,
                  },
                }))
              }
              placeholder="Client ID"
              className="bg-transparent border-[var(--stroke)]"
            />
            <Input
              value={state.clientSecret}
              onChange={(e) =>
                setOauthState((prev) => ({
                  ...prev,
                  [provider.provider]: {
                    ...prev[provider.provider],
                    clientSecret: e.target.value,
                  },
                }))
              }
              placeholder="Client Secret (leave blank to keep)"
              type="password"
              className="bg-transparent border-[var(--stroke)]"
            />
          </div>
          <Button
            onClick={onUpdate}
            disabled={isSaving}
            className="bg-[var(--gold)] text-black hover:opacity-90"
          >
            Save provider
          </Button>
        </div>
      );
    });
  }, [oauthQuery.data, oauthState, updateOAuth, isSaving]);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">Admin Settings</h1>
        <p className="text-sm text-[var(--muted-text)]">
          Control free tier limits and OAuth providers.
        </p>
      </div>

      <section className="space-y-4 border border-[var(--stroke)] rounded-[var(--r2)] p-6 bg-[var(--panel2)]">
        <div>
          <h2 className="text-lg font-semibold">Free Tier</h2>
          <p className="text-xs text-[var(--muted-text)]">
            Configure what&apos;s included without a subscription.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs text-[var(--muted-text)]">Free projects</label>
            <Input
              type="number"
              min={0}
              value={freeProjectLimit}
              onChange={(e) => setFreeProjectLimit(Number(e.target.value))}
              className="bg-transparent border-[var(--stroke)]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-[var(--muted-text)]">Free templates</label>
            <Input
              type="number"
              min={0}
              value={freeTemplateLimit}
              onChange={(e) => setFreeTemplateLimit(Number(e.target.value))}
              className="bg-transparent border-[var(--stroke)]"
            />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={freeAllowsAi}
              onChange={(e) => setFreeAllowsAi(e.target.checked)}
              className="size-4"
            />
            Allow AI generation on free tier
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={freeAllowsBgRemoval}
              onChange={(e) => setFreeAllowsBgRemoval(e.target.checked)}
              className="size-4"
            />
            Allow background removal on free tier
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={freeAllowsExport}
              onChange={(e) => setFreeAllowsExport(e.target.checked)}
              className="size-4"
            />
            Allow exports on free tier
          </label>
        </div>
        <Button
          onClick={onSaveSettings}
          disabled={isSaving || settingsQuery.isLoading}
          className="bg-[var(--gold)] text-black hover:opacity-90"
        >
          Save free tier settings
        </Button>
      </section>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">OAuth Providers</h2>
          <p className="text-xs text-[var(--muted-text)]">
            Enable providers and update client credentials. Environment variables must also be set for each provider.
          </p>
        </div>
        <div className="space-y-4">
          {providerCards}
        </div>
      </section>
    </div>
  );
}
