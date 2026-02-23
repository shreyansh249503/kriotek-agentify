"use client";

import { BotForm } from "@/components";
import { CreateBotInput } from "@/types/bot";
import { NewBotContainer } from "./styled";
import { useRouter } from "next/navigation";
import { useCreateBot } from "@/hooks/useBot";

export default function NewBotPage() {
  const router = useRouter();
  const { mutate, isPending } = useCreateBot();

  const handleCreate = (data: CreateBotInput) => {
    mutate(data, {
      onSuccess: () => {
        router.push("/admin");
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
