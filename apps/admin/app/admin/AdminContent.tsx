"use client";

import { useEffect, useState, useMemo } from "react";
import { Loader, SearchBar, EmptyState, StatusBadge } from "@/components";
import { supabase } from "@/lib/supabase";
import { Bot } from "@/types/bot";
import {
  AddNewBotButton,
  AdminContainer,
  AdminContentWrapper,
  BotCardContainer,
  EditBotButton,
  IngestButton,
  ControlsContainer,
  FilterSelect,
  BotMeta,
  BotDescription,
  BotActions,
  BotName,
} from "./styled";
import { PlusCircle, Robot as BotIcon } from "@boxicons/react";

export default function AdminContent() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  // const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    async function loadBots() {
      setLoading(true);
      const session = await supabase.auth.getSession();

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bots`, {
          headers: {
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setBots(data);
        }
      } catch (error) {
        console.error("Failed to load bots:", error);
      } finally {
        setLoading(false);
      }
    }

    loadBots();
  }, []);

  const filteredBots = useMemo(() => {
    return bots.filter((bot) => {
      const matchesSearch = bot.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [bots, searchTerm]);

  if (loading) {
    return (
      <AdminContainer
        style={{
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Loader />
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <ControlsContainer>
        <SearchBar placeholder="Search bots..." onSearch={setSearchTerm} />
        {/* <div style={{ display: "flex", gap: "12px", alignItems: "center" }}> */}
          <AddNewBotButton href={"/admin/new"}>
            New Bot
            <PlusCircle size="sm" />
          </AddNewBotButton>
        {/* </div> */}
      </ControlsContainer>

      {filteredBots.length > 0 ? (
        <AdminContentWrapper>
          {filteredBots.map((bot) => (
            <BotCardContainer key={bot.id}>
              <BotMeta>
                <BotName>{bot.name}</BotName>
                <StatusBadge status="active" />
              </BotMeta>

              <BotDescription>
                {/* A helpful AI assistant ready to chat with users and answer
                questions. */}
                {bot.description}
              </BotDescription>

              <BotActions>
                <EditBotButton
                  href={`/admin/bot/${bot.id}/edit-bot`}
                  style={{ flex: 1 }}
                >
                  Edit
                </EditBotButton>
                <IngestButton
                  href={`/admin/bots/${bot.public_key}/ingest`}
                  style={{ flex: 1 }}
                >
                  Ingest
                </IngestButton>
              </BotActions>
            </BotCardContainer>
          ))}
        </AdminContentWrapper>
      ) : (
        <EmptyState
          icon={<BotIcon />}
          title={
            searchTerm
              ? `No bots found matching "${searchTerm}"`
              : "No bots created yet"
          }
          description={
            searchTerm
              ? "Try adjusting your search terms or filters"
              : "Get started by creating your first AI bot assistant."
          }
          actionLabel={!searchTerm ? "Create New Bot" : undefined}
          onAction={
            !searchTerm
              ? () => (window.location.href = "/admin/new")
              : undefined
          }
        />
      )}
    </AdminContainer>
  );
}
