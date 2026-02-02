"use client";
import { BotForm, Loader } from "@/components";
import { supabase } from "@/lib/supabase";
import { Bot, UpdateBotInput } from "@/types/bot";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { NewBotContainer } from "./styled";

export default function EditBotPage() {
  const { id } = useParams<{ id: string }>();
  const [bot, setBot] = useState<Bot | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3000/api/bots/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBot(data);
        setLoading(false);
      });
  }, [id]);

  async function updateBot(data: UpdateBotInput) {
    const session = await supabase.auth.getSession();

    const res = await fetch(`http://localhost:3000/api/bots/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.data.session?.access_token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      alert("Failed to update bot");
      return;
    }

    alert("Bot updated successfully");
    window.location.href = "/admin";
  }

  if (loading) return <Loader fullScreen />;
  return (
    <NewBotContainer>
      <BotForm
        title="Edit Bot"
        initialData={bot}
        submitLabel="Update Bot"
        onSubmit={async (data) => {
          if (bot?.id) {
            await updateBot({ ...data, id: bot.id });
          }
        }}
      />
    </NewBotContainer>
  );
}
