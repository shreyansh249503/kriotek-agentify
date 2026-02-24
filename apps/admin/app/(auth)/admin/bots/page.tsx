"use client";

import { useState, useMemo } from "react";
import { Loader, SearchBar, EmptyState, StatusBadge } from "@/components";
import {
  AdminContentWrapper,
  BotCardContainer,
  EditBotButton,
  IngestButton,
  ControlsContainer,
  BotMeta,
  BotDescription,
  BotActions,
  BotName,
  BotsContainer,
  LoadingContainer,
} from "./styled";
import { Robot as BotIcon } from "@boxicons/react";
import { useBots } from "@/hooks/useBot";

export default function BotsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: bots, isLoading } = useBots();

  const filteredBots = useMemo(() => {
    return (bots ?? []).filter((bot) => {
      const matchesSearch = bot.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [bots, searchTerm]);

  if (isLoading) {
    return (
      <LoadingContainer>
        <Loader />
      </LoadingContainer>
    );
  }
  return (
    <BotsContainer>
      <ControlsContainer>
        <SearchBar placeholder="Search bots..." onSearch={setSearchTerm} />
      </ControlsContainer>

      {filteredBots.length > 0 ? (
        <AdminContentWrapper>
          {filteredBots.map((bot) => (
            <BotCardContainer key={bot.id}>
              <BotMeta>
                <BotName>{bot.name}</BotName>
                <StatusBadge status="active" />
              </BotMeta>

              <BotDescription>{bot.description}</BotDescription>

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
    </BotsContainer>
  );
}
