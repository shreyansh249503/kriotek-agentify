"use client";
import { BotForm, Loader } from "@/components";
import { UpdateBotInput } from "@/types/bot";
import { useParams, useRouter } from "next/navigation";
import { NewBotContainer } from "./styled";
import { useBot, useUpdateBot } from "@/hooks/useBot";
import { useBilling } from "@/hooks/useBilling";
import { useEffect } from "react";
import { useBreadcrumb } from "@/context/BreadcrumbContext";

export default function EditBotPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { setBreadcrumbMeta } = useBreadcrumb();

  const { data: bot, isLoading } = useBot(id);
  const { mutate, isPending } = useUpdateBot();
  const { data: billing } = useBilling();

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

  useEffect(() => {
    if (bot) {
      setBreadcrumbMeta({
        customLabels: { [id]: bot.name },
        nonLinkable: [id],
      });
    }
  }, [bot]);
  if (isLoading) return <Loader fullScreen />;

  return (
    <NewBotContainer>
      <BotForm
        key={bot?.id}
        initialData={bot}
        submitLabel="Update Bot"
        loading={isPending}
        disableLeadCapture={billing?.plan === "free"}
        onSubmit={async (data) => {
          if (bot?.id) {
            await handleSubmit({ ...data, id: bot.id });
          }
        }}
      />
    </NewBotContainer>
  );
}
