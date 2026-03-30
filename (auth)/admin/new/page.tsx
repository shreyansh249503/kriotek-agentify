"use client";

import { BotForm } from "@/components";
import { CreateBotInput, Bot } from "@/types/bot";
import { NewBotContainer } from "./styled";
import { useRouter } from "next/navigation";
import { useCreateBot } from "@/hooks/useBot";

export default function NewBotPage() {
  const router = useRouter();
  const { mutate, isPending } = useCreateBot();

  const handleCreate = (data: CreateBotInput) => {
    mutate(data, {
      onSuccess: (botData: Bot) => {
        if (botData?.public_key) {
          router.push(`/admin/bots/${botData.public_key}/ingest`);
        } else {
          router.push("/admin");
        }
      },
    });
  };

  return (
    <NewBotContainer>
      <BotForm
        submitLabel="Create Bot"
        onSubmit={handleCreate}
        loading={isPending}
      />
    </NewBotContainer>
  );
}
