import { COLOR } from "@/styles";
import {
  Badge,
  BotEngagementChatText,
  BotEngagementVolume,
  BotEngagementVolumeText,
  BotInitial,
  BotListLink,
  BotName,
  BotROIBar,
  BotROIContainer,
  BotROIValue,
  BotTableInitialContainer,
  PerformanceTableSubWrapper,
  PerformanceTableWrapper,
} from "./styled";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

import { BotConvoStat, BotLeadStat } from "@/types/analytics";
import { Bot } from "@/types/bot";

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
  return (
    <PerformanceTableWrapper>
      <PerformanceTableSubWrapper>
        <thead>
          <tr>
            <th>Bot Identity</th>
            <th>User Interactions</th>
            <th>Successful Conversions</th>
            <th>Conversion Rate</th>
            <th>Temporal Activity</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {convosPerBot.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: COLOR.TEXT_SECONDARY,
                }}
              >
                Start a conversation to see performance metrics.
              </td>
            </tr>
          ) : (
            convosPerBot.map((row) => {
              const leads =
                leadsPerBot.find((l) => l.bot_id === row.bot_id)?.total_leads ??
                0;
              const bot = bots.find((b) => b.id === row.bot_id);
              const rate =
                row.total_conversations > 0
                  ? Math.min(
                      (leads / row.total_conversations) * 100,
                      100,
                    ).toFixed(1)
                  : "0.0";

              return (
                <tr key={row.bot_id}>
                  <td>
                    <BotTableInitialContainer>
                      <BotInitial>
                        {row.bot_name.charAt(0).toUpperCase()}
                      </BotInitial>
                      <BotName>{row.bot_name}</BotName>
                    </BotTableInitialContainer>
                  </td>
                  <td>
                    <BotEngagementVolume>
                      <BotEngagementChatText>
                        {row.total_conversations} chats
                      </BotEngagementChatText>
                      <BotEngagementVolumeText>
                        {row.total_messages} messages
                      </BotEngagementVolumeText>
                    </BotEngagementVolume>
                  </td>
                  <td>
                    <Badge $type={leads > 0 ? "success" : "primary"}>
                      {leads} Leads
                    </Badge>
                  </td>
                  <td>
                    <BotROIContainer>
                      <div>
                        <BotROIValue>{rate}%</BotROIValue>
                      </div>
                      <BotROIBar>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(Number(rate), 100)}%`,
                          }}
                          transition={{ duration: 1, delay: 0.5 }}
                          style={{
                            height: "100%",
                            background: COLOR.PRIMARY,
                          }}
                        />
                      </BotROIBar>
                    </BotROIContainer>
                  </td>
                  <td>
                    <div
                      style={{
                        fontSize: 12,
                        color: COLOR.TEXT_SECONDARY,
                      }}
                    >
                      <span style={{ display: "block" }}>
                        Month: <strong>{row.conversations_this_month}</strong>
                      </span>
                      <span style={{ display: "block" }}>
                        Week: <strong>{row.conversations_this_week}</strong>
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {bot && (
                      <BotListLink href={`/admin/bot/${bot.id}/edit-bot`}>
                        Manage{" "}
                        <ChevronRight size={14} style={{ marginLeft: 4 }} />
                      </BotListLink>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </PerformanceTableSubWrapper>
    </PerformanceTableWrapper>
  );
};
