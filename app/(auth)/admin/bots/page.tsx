"use client";

import { useState, useMemo } from "react";
import {
  Loader,
  SearchBar,
  EmptyState,
  Pagination,
  StatusBadge,
} from "@/components";
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
  BotIconWrapper,
  GlobalBotsStyle,
} from "./styled";
import { RobotIcon, SpinnerIcon } from "@phosphor-icons/react";
import { useBots } from "@/hooks/useBot";
import { useRouter } from "next/navigation";

type LoadingAction = { botId: string; type: "edit" | "ingest" } | null;

export default function BotsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);
  const pageSize = 8;

  const { data: bots, isLoading } = useBots();

  const handleNavigate = async (
    href: string,
    botId: string,
    type: "edit" | "ingest",
  ) => {
    setLoadingAction({ botId, type });
    router.push(href);
  };

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    setCurrentPage(1);
  };

  const filteredBots = useMemo(() => {
    return (bots ?? []).filter((bot) => {
      const matchesSearch = bot.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [bots, searchTerm]);

  const totalPages = Math.ceil(filteredBots.length / pageSize);
  const currentBots = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBots.slice(start, start + pageSize);
  }, [filteredBots, currentPage]);

  if (isLoading) {
    return (
      <LoadingContainer>
        <Loader />
      </LoadingContainer>
    );
  }
  return (
    <BotsContainer>
      <GlobalBotsStyle />
      <ControlsContainer>
        <SearchBar placeholder="Search bots..." onSearch={handleSearch} />
      </ControlsContainer>

      {filteredBots.length > 0 ? (
        <TableContainer>
          <StyledTable>
            <TableHead>
              <TableRow>
                <TableHeader>Name</TableHeader>
                <TableHeader>Description</TableHeader>
                <TableHeader>Contact Lead</TableHeader>
                <TableHeader style={{ textAlign: "center" }}>
                  Actions
                </TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentBots.map((bot) => {
                const isEditLoading =
                  loadingAction?.botId === bot.id &&
                  loadingAction?.type === "edit";
                const isIngestLoading =
                  loadingAction?.botId === bot.id &&
                  loadingAction?.type === "ingest";

                return (
                  <TableRow key={bot.id}>
                    <TableCell>
                      <BotName>
                        <BotIconWrapper $color={bot.primary_color}>
                          <RobotIcon size={20} />
                        </BotIconWrapper>
                        {bot.name}
                      </BotName>
                    </TableCell>
                    <TableCell>
                      <BotDescription>{bot.description}</BotDescription>
                    </TableCell>
                    <TableCell>
                      {bot.contact_enabled ? (
                        <StatusBadge status="active">Enabled</StatusBadge>
                      ) : (
                        <StatusBadge status="inactive">Disabled</StatusBadge>
                      )}
                    </TableCell>
                    <TableCell>
                      <ActionCellWrapper>
                        <EditBotButton
                          as="button"
                          type="button"
                          disabled={!!loadingAction}
                          onClick={() =>
                            handleNavigate(
                              `/admin/bot/${bot.id}/edit-bot`,
                              bot.id,
                              "edit",
                            )
                          }
                        >
                          {isEditLoading ? (
                            <SpinnerIcon size={14} className="spin" />
                          ) : (
                            "Edit"
                          )}
                        </EditBotButton>
                        <IngestButton
                          as="button"
                          type="button"
                          disabled={!!loadingAction}
                          onClick={() =>
                            handleNavigate(
                              `/admin/bots/${bot.public_key}/ingest`,
                              bot.id,
                              "ingest",
                            )
                          }
                        >
                          {isIngestLoading ? (
                            <SpinnerIcon size={14} className="spin" />
                          ) : (
                            "Ingest"
                          )}
                        </IngestButton>
                      </ActionCellWrapper>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </StyledTable>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            totalItems={filteredBots.length}
          />
        </TableContainer>
      ) : (
        <EmptyState
          icon={<RobotIcon size={48} weight="duotone" />}
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
