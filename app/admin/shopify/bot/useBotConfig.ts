"use client";

import { useEffect, useState, useCallback } from "react";
import { useSessionToken } from "../lib/useSessionToken";
import { BotConfig } from "./type";

export type BannerTone = "success" | "critical";

export interface BannerState {
  tone: BannerTone;
  message: string;
}

export function useBotConfig() {
  const { fetchWithToken } = useSessionToken();
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<BannerState | null>(null);

  useEffect(() => {
    fetchWithToken("/api/shopify/admin/bot")
      .then((r) => {
        if (r.status === 401) {
          setUnauthorized(true);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data && data.bot) {
          setConfig(data.bot);
        }
      })
      .catch((e) => console.error("Error loading bot config:", e))
      .finally(() => setLoading(false));
  }, [fetchWithToken]);

  const update = useCallback(
    <K extends keyof BotConfig>(field: K, value: BotConfig[K]) => {
      setConfig((prev) => (prev ? { ...prev, [field]: value } : prev));
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!config) return;
    setSaving(true);
    setBanner(null);

    try {
      const res = await fetchWithToken("/api/shopify/admin/bot", {
        method: "PATCH",
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setBanner({
          tone: "success",
          message: "Bot configuration saved successfully.",
        });
      } else {
        setBanner({
          tone: "critical",
          message: "Failed to save configuration. Try again.",
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setBanner({ tone: "critical", message: `Save error: ${message}` });
    } finally {
      setSaving(false);
    }
  }, [config, fetchWithToken]);

  return {
    config,
    loading,
    unauthorized,
    saving,
    banner,
    setBanner,
    update,
    handleSave,
  };
}
