"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bot } from "@/types/bot";
import {
  AddNewBotButton,
  AdminContainer,
  AdminContentWrapper,
  BotCardContainer,
  EditBotButton,
  IngestButton,
  YourBotsTitle,
} from "./styled";
import { PlusCircle } from "@boxicons/react";

export default function AdminContent() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadBots() {
      setLoading(true);
      const session = await supabase.auth.getSession();

      const res = await fetch("http://localhost:3000/api/bots", {
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
      });

      const data = await res.json();
      setBots(data);
      setLoading(false);
    }

    loadBots();
  }, []);

  return (
    <AdminContainer>
      <YourBotsTitle>Your Bots</YourBotsTitle>
      <AddNewBotButton href={"/admin/new"}>
        Add new bot
        <PlusCircle size="sm" />
      </AddNewBotButton>
      <AdminContentWrapper>
        {loading && <p>Loading bots...</p>}
        {bots.map((bot) => (
          <BotCardContainer key={bot.id}>
            <strong>{bot.name}</strong>

            <IngestButton href={`/admin/bots/${bot.public_key}/ingest`}>
              Ingest
            </IngestButton>
            <EditBotButton href={`/admin/bot/${bot.id}/edit-bot`}>
              Edit Bot
            </EditBotButton>
          </BotCardContainer>
        ))}
      </AdminContentWrapper>
    </AdminContainer>
  );
}
