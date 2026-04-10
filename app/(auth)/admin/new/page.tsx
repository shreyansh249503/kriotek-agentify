"use client";

import { useState } from "react";
import { BotForm } from "@/components";
import { CreateBotInput, Bot } from "@/types/bot";
import { NewBotContainer } from "./styled";
import { useRouter } from "next/navigation";
import { useCreateBot } from "@/hooks/useBot";
import { useBilling } from "@/hooks/useBilling";
import Link from "next/link";
import axios from "axios";

export default function NewBotPage() {
  const router = useRouter();
  const { mutate, isPending } = useCreateBot();
  const { data: billing } = useBilling();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreate = (data: CreateBotInput) => {
    setErrorMsg(null);
    mutate(data, {
      onSuccess: (botData: Bot) => {
        if (botData?.public_key) {
          router.push(`/admin/bots/${botData.public_key}/ingest`);
        } else {
          router.push("/admin");
        }
      },
      onError: (err) => {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.error
          : null;
        setErrorMsg(message ?? "Something went wrong. Please try again.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
    });
  };

  return (
    <NewBotContainer>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        {errorMsg && (
          <div
            style={{
              width: "100%",
              padding: "14px 20px",
              borderRadius: 12,
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              color: "#9a3412",
              fontSize: 14,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span>{errorMsg}</span>
            <Link
              href="/admin/billing"
              style={{
                fontWeight: 700,
                color: "#9a3412",
                textDecoration: "underline",
                whiteSpace: "nowrap",
              }}
            >
              Upgrade plan
            </Link>
          </div>
        )}
        <BotForm
          submitLabel="Create Bot"
          onSubmit={handleCreate}
          loading={isPending}
          disableLeadCapture={billing?.plan === "free"}
        />
      </div>
    </NewBotContainer>
  );
}
