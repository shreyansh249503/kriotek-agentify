"use client";

import { useState, useMemo } from "react";
import { Loader, SearchBar, EmptyState, StatusBadge } from "@/components";
import {
  TableContainer,
  StyledTable,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  BotName,
  BotDescription,
  ActionCellWrapper,
  EditBotButton,
  IngestButton,
  ControlsContainer,
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
        <TableContainer>
          <StyledTable>
            <TableHead>
              <TableRow>
                <TableHeader>Name</TableHeader>
                <TableHeader>Description</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader style={{ textAlign: "right" }}>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBots.map((bot) => (
                <TableRow key={bot.id}>
                  <TableCell>
                    <BotName>{bot.name}</BotName>
                  </TableCell>
                  <TableCell>
                    <BotDescription>{bot.description}</BotDescription>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status="active" />
                  </TableCell>
                  <TableCell>
                    <ActionCellWrapper>
                      <EditBotButton
                        href={`/admin/bot/${bot.id}/edit-bot`}
                      >
                        Edit
                      </EditBotButton>
                      <IngestButton
                        href={`/admin/bots/${bot.public_key}/ingest`}
                      >
                        Ingest
                      </IngestButton>
                    </ActionCellWrapper>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </StyledTable>
        </TableContainer>
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
