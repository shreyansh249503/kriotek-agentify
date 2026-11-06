"use client";

import { useState, useMemo } from "react";
import {
  Loader,
  SearchBar,
  EmptyState,
  Pagination,
} from "@/components";
import {
  ControlsContainer,
  BotsContainer,
  LoadingContainer,
  GlobalBotsStyle,
  AgentsContainer,
  EmptyBotsWrapper,
  EmptyBannerCard,
  EmptyLogoCircle,
  EmptyMiniChatWindow,
  EmptyMiniChatHeader,
  EmptyMiniAvatar,
  EmptyMiniChatTitle,
  EmptyMiniChatBody,
  EmptyMiniBotBubble,
  EmptyMiniUserBubble,
  EmptyMiniBotResponseBubble,
  EmptyTitle,
  EmptyDescription,
  EmptyNewAgentButton,
  AgentsEmptyContainer,
} from "./styled";
import { RobotIcon, Plus } from "@phosphor-icons/react";
import { useBots } from "@/hooks/useBot";
import { useRouter } from "next/navigation";
import { BotCard } from "../components";

const AgentifyIcon = ({ size = 36 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Agentify Logo"
  >
    <path
      d="M12.5 28C12.5 28 14.8 17.5 22 9C19 13.5 17.5 19 18 28C15.5 28 12.5 28 12.5 28Z"
      fill="#111111"
    />
    <path
      d="M20.5 17C23.5 20.5 26.5 24 28 28C25.5 28 22.5 28 22.5 28C22 23 21 19.5 20.5 17Z"
      fill="#111111"
    />
  </svg>
);

export default function BotsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const { data: bots, isLoading } = useBots();

  const handleEdit = (botId: string) => {
    router.push(`/admin/bot/${botId}/edit-bot`);
  };

  const handleIngest = (publicKey: string) => {
    router.push(`/admin/bots/${publicKey}/ingest`);
  };

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    setCurrentPage(1);
  };

  const filteredBots = useMemo(() => {
    return (bots ?? []).filter((bot) => {
      const matchesSearch =
        bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bot.description && bot.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bot.company_name && bot.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
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

  const hasNoBotsAtAll = !bots || bots.length === 0;

  if (hasNoBotsAtAll && !searchTerm) {
    return (
      <AgentsEmptyContainer>
        <GlobalBotsStyle />
        <EmptyBotsWrapper>
          <EmptyBannerCard>
            <EmptyLogoCircle>
              <AgentifyIcon size={100} />
            </EmptyLogoCircle>

            <EmptyMiniChatWindow>
              <EmptyMiniChatHeader>
                <EmptyMiniAvatar>
                  <AgentifyIcon size={20} />
                </EmptyMiniAvatar>
                <EmptyMiniChatTitle>AI Bot</EmptyMiniChatTitle>
              </EmptyMiniChatHeader>

              <EmptyMiniChatBody>
                <EmptyMiniBotBubble />
                <EmptyMiniUserBubble />
                <EmptyMiniBotResponseBubble />
              </EmptyMiniChatBody>
            </EmptyMiniChatWindow>
          </EmptyBannerCard>

          <EmptyTitle>No agents yet...</EmptyTitle>
          <EmptyDescription>
            Create your first AI Agent to start automating support, generating leads, and answering customer questions
          </EmptyDescription>

          <EmptyNewAgentButton
            type="button"
            onClick={() => router.push("/admin/new")}
          >
            <Plus size={16} weight="bold" />
            <span>New AI agent</span>
          </EmptyNewAgentButton>
        </EmptyBotsWrapper>
      </AgentsEmptyContainer>
    );
  }

  return (
    <BotsContainer>
      <GlobalBotsStyle />
      <ControlsContainer>
        <SearchBar placeholder="Search bots..." onSearch={handleSearch} />
      </ControlsContainer>

      {filteredBots.length > 0 ? (
        <>
          <AgentsContainer>
            {currentBots.map((bot) => (
              <BotCard
                key={bot.id}
                bot={bot}
                onEdit={() => handleEdit(bot.id)}
                onIngest={() => handleIngest(bot.public_key)}
              />
            ))}
          </AgentsContainer>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              totalItems={filteredBots.length}
            />
          )}
        </>
      ) : (
        <EmptyState
          icon={<RobotIcon size={48} weight="duotone" />}
          title={`No bots found matching "${searchTerm}"`}
          description="Try adjusting your search terms or filters"
        />
      )}
    </BotsContainer>
  );
}
