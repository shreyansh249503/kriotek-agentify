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

  // useEffect(() => {
  //   fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bots/${id}`)
  //     .then((res) => {
  //       if (!res.ok) {
  //         throw new Error(`HTTP error! status: ${res.status}`);
  //       }
  //       return res.json();
  //     })
  //     .then((data) => {
  //       console.log("Fetched bot:", data);
  //       setBot(data);
  //       setLoading(false);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching bot:", error);
  //       setLoading(false);
  //       alert("Failed to load bot");
  //     });
  // }, [id]);

  // async function updateBot(data: UpdateBotInput) {
  //   const session = await supabase.auth.getSession();

  //   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bots/${id}`, {
  //     method: "PUT",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${session.data.session?.access_token}`,
  //     },
  //     body: JSON.stringify(data),
  //   });
  //   if (!res.ok) {
  //     alert("Failed to update bot");
  //     return;
  //   }

  //   alert("Bot updated successfully");
  //   window.location.href = "/admin";
  // }

  // if (loading) return <Loader fullScreen />;
  return (
    <NewBotContainer>
      <BotForm
        key={bot?.id}
        title="Edit Bot"
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
