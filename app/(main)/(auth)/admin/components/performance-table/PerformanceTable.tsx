"use client";

import {
  PerformanceTableWrapper,
  PerformanceTableSubWrapper,
  AgentCell,
  AgentAvatar,
  AgentName,
  ChatsText,
  LeadsText,
  ConversionContainer,
  ConversionRateText,
  ConversionProgressBar,
  ConversionProgressFill,
  ManageButton,
  ManageButtonText,
  ManageButtonIcon,
  PaginationWrapper,
  PaginationButton,
  PaginationText,
  EmptyStateContainer,
} from "./styled";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { BotConvoStat, BotLeadStat } from "@/types/analytics";
import { Bot } from "@/types/bot";
import { useState } from "react";

type PerformanceTableProps = {
  convosPerBot: BotConvoStat[];
  leadsPerBot: BotLeadStat[];
  bots: Bot[];
};

export const PerformanceTable = ({
  convosPerBot,
  leadsPerBot,
  bots,
}: PerformanceTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(convosPerBot.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = convosPerBot.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const formatRate = (rateNum: number) => {
    if (rateNum === 0 || isNaN(rateNum)) return "0%";
    return Number.isInteger(rateNum) ? `${rateNum}%` : `${rateNum.toFixed(1)}%`;
  };

  return (
    <PerformanceTableWrapper data-testid="performance-table">
      <PerformanceTableSubWrapper>
        <thead>
          <tr>
            <th>Agent</th>
            <th>Conversations</th>
            <th>Leads</th>
            <th>Conversion</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {convosPerBot.length === 0 ? (
            <tr>
              <td colSpan={5}>
                <EmptyStateContainer data-testid="performance-empty-state">
                  Start a conversation to see performance metrics.
                </EmptyStateContainer>
              </td>
            </tr>
          ) : (
            currentItems.map((row) => {
              const leads =
                leadsPerBot.find((l) => l.bot_id === row.bot_id)?.total_leads ??
                0;
              const bot = bots.find((b) => b.id === row.bot_id);
              const rawRate =
                row.total_conversations > 0
                  ? Math.min((leads / row.total_conversations) * 100, 100)
                  : 0;
              const formattedRate = formatRate(rawRate);
              const formattedLeads = String(leads).padStart(2, "0");

              return (
                <tr key={row.bot_id} data-testid="performance-row">
                  <td>
                    <AgentCell>
                      <AgentAvatar>
                        {row.bot_name.charAt(0).toUpperCase()}
                      </AgentAvatar>
                      <AgentName data-testid="perf-agent-name">{row.bot_name}</AgentName>
                    </AgentCell>
                  </td>
                  <td>
                    <ChatsText data-testid="perf-chats">{row.total_conversations} chats</ChatsText>
                  </td>
                  <td>
                    <LeadsText data-testid="perf-leads">{formattedLeads}</LeadsText>
                  </td>
                  <td>
                    <ConversionContainer>
                      <ConversionRateText data-testid="perf-conversion-rate">{formattedRate}</ConversionRateText>
                      <ConversionProgressBar>
                        <ConversionProgressFill
                          data-testid="perf-conversion-fill"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(rawRate, 100)}%`,
                          }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </ConversionProgressBar>
                    </ConversionContainer>
                  </td>
                  <td>
                    <ManageButton
                      data-testid="perf-manage-btn"
                      href={bot ? `/admin/bot/${bot.id}/edit-bot` : `/admin/bots`}
                      aria-label="Manage"
                    >
                      <ManageButtonText>Manage</ManageButtonText>
                      <ManageButtonIcon aria-hidden="true">➜</ManageButtonIcon>
                    </ManageButton>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </PerformanceTableSubWrapper>

      {convosPerBot.length > itemsPerPage && (
        <PaginationWrapper>
          <PaginationText>
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, convosPerBot.length)} of{" "}
            {convosPerBot.length} results
          </PaginationText>
          <PaginationButton
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous Page"
          >
            <ChevronLeft size={16} />
          </PaginationButton>
          {[...Array(totalPages)].map((_, i) => (
            <PaginationButton
              key={i + 1}
              $active={currentPage === i + 1}
              onClick={() => goToPage(i + 1)}
            >
              {i + 1}
            </PaginationButton>
          ))}
          <PaginationButton
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next Page"
          >
            <ChevronRight size={16} />
          </PaginationButton>
        </PaginationWrapper>
      )}
    </PerformanceTableWrapper>
  );
};
