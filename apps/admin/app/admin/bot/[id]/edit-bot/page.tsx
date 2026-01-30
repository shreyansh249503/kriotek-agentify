"use client";
import BotForm from "@/components/BotForm";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditBotPage() {
  const { id } = useParams<{ id: string }>();
  const [bot, setBot] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3000/api/bots/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBot(data);
        setLoading(false);
      });
  }, [id]);

  async function updateBot(data: any) {
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
  }

  if (loading) return <p>Loading...</p>;
  return (
    <div>
      <h2>Edit Bot</h2>
      <BotForm
        initialData={bot}
        submitLabel="Update Bot"
        onSubmit={updateBot}
      />
    </div>
  );
}
