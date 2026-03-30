"use client";
import { BotForm, Loader } from "@/components";
import { UpdateBotInput } from "@/types/bot";
import { useParams, useRouter } from "next/navigation";
import { NewBotContainer } from "./styled";
import { useBot, useUpdateBot } from "@/hooks/useBot";

export default function EditBotPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: bot, isLoading } = useBot(id);
  const { mutate, isPending } = useUpdateBot();

  const handleSubmit = async (data: UpdateBotInput) => {
    mutate(
      { id, data },
      {
        onSuccess: () => {
          router.push("/admin");
        },
      },
    );
  };

  if (isLoading) return <Loader fullScreen />;

  return (
    <NewBotContainer>
      <BotForm
        key={bot?.id}
        initialData={bot}
        submitLabel="Update Bot"
        loading={isPending}
        onSubmit={async (data) => {
          if (bot?.id) {
            await handleSubmit({ ...data, id: bot.id });
          }
        }}
      />
    </NewBotContainer>
  );
}
