import { COLOR } from "@/styles";
import {
  Badge,
  BotInitial,
  BotListLink,
  PerformanceTableSubWrapper,
  PerformanceTableWrapper,
} from "./styled";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

type PerformanceTableProps = {
  convosPerBot: any[];
  leadsPerBot: any[];
  bots: any[];
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
            <th>Engagement Volume</th>
            <th>Successful Conversions</th>
            <th>ROI Rate</th>
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
                  ? ((leads / row.total_conversations) * 100).toFixed(1)
                  : "0.0";

              return (
                <tr key={row.bot_id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <BotInitial>
                        {row.bot_name.charAt(0).toUpperCase()}
                      </BotInitial>
                      <span style={{ fontWeight: 700, color: "#1e293b" }}>
                        {row.bot_name}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color: COLOR.PRIMARY_HOVER,
                        }}
                      >
                        {row.total_conversations} chats
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: COLOR.TEXT_SECONDARY,
                        }}
                      >
                        {row.total_messages} messages
                      </span>
                    </div>
                  </td>
                  <td>
                    <Badge $type={leads > 0 ? "success" : "primary"}>
                      {leads} Leads
                    </Badge>
                  </td>
                  <td>
                    <div style={{ width: "100px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 4,
                          fontSize: 11,
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{rate}%</span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          width: "100%",
                          background: "#f1f5f9",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}
                      >
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
                      </div>
                    </div>
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
