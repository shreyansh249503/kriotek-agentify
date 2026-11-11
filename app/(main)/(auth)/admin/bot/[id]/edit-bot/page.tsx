"use client";
import { BotForm, Loader } from "@/components";
import { UpdateBotInput } from "@/types/bot";
import { useParams, useRouter } from "next/navigation";
import { NewBotContainer } from "./styled";
import { useBot, useUpdateBot } from "@/hooks/useBot";
import { useEffect } from "react";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { getApiErrorMessage } from "@/lib/apiError";

export default function EditBotPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { setBreadcrumbMeta } = useBreadcrumb();

  const { data: bot, isLoading } = useBot(id);
  const { mutate, isPending, error } = useUpdateBot();

  const handleSubmit = async (data: UpdateBotInput) => {
    mutate(
      { id, data },
      {
        onSuccess: () => {
          router.push("/admin/bots");
        },
      },
    );
  };

  useEffect(() => {
    if (bot) {
      setBreadcrumbMeta({
        customLabels: { [id]: bot.name },
        nonLinkable: [id],
      });
    }
  }, [bot, id, setBreadcrumbMeta]);
  if (isLoading) return <Loader fullScreen />;

  return (
    <NewBotContainer>
      <BotForm
        key={bot?.id}
        initialData={bot}
        submitLabel="Update Bot"
        loading={isPending}
        error={error ? getApiErrorMessage(error, "Couldn't save the bot. Please try again.") : null}
        onSubmit={async (data) => {
          if (bot?.id) {
            await handleSubmit({ ...data, id: bot.id });
          }
        }}
      />
    </NewBotContainer>
  );
}
