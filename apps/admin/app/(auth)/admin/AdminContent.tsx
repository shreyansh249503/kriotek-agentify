"use client";

import { useBots } from "@/hooks/useBot";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Loader } from "@/components";
import { motion } from "framer-motion";
import {
  Bot,
  MessageSquare,
  Users,
  Zap,
  Plus,
  List,
  Settings,
  ArrowUpRight,
  TrendingUp,
  Activity,
  ChevronRight,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Container,
  StatsGrid,
  DashboardWrapper,
  SectionTitle,
  StatCard,
  StatCardTop,
  StatIconBox,
  StatDelta,
  StatValue,
  StatLabel,
  PanelRow,
  Panel,
  ChartWrapper,
  BotListItem,
  BotListItemLeft,
  BotInitial,
  BotListName,
  BotListDate,
  BotListLink,
  QuickActionsGrid,
  QuickActionCard,
  QuickActionIcon,
  QuickActionText,
  QuickActionTitle,
  QuickActionDesc,
  PerformanceTableWrapper,
  PerformanceTable,
  Badge,
} from "./styled";

import { COLOR } from "@/styles";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
} as const;

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; fill: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${COLOR.BORDER}66`,
        borderRadius: 16,
        padding: "12px 16px",
        fontSize: 12,
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      }}
    >
      <p style={{ margin: "0 0 8px", fontWeight: 700, color: COLOR.DARK }}>
        {label}
      </p>
      {payload.map((p, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            margin: "6px 0",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background:
                p.fill || (p.name === "Engagement" ? T.primary : T.dark),
              boxShadow: `0 0 8px ${p.fill}44`,
            }}
          />
          <span style={{ color: COLOR.TEXT_SECONDARY, fontWeight: 500 }}>
            {p.name}:
          </span>
          <span
            style={{ marginLeft: "auto", fontWeight: 700, color: COLOR.DARK }}
          >
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const PIE_COLORS = [COLOR.PRIMARY, "#2E2E2E", "#95CC00", "#D4E8C1", "#A8E10C"];

/* ── helpers ── */
const formatDate = (date: string | Date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const T = {
  primary: COLOR.PRIMARY,
  primaryHover: COLOR.PRIMARY_HOVER,
  border: COLOR.BORDER,
  dark: COLOR.DARK,
  text: COLOR.TEXT,
  textSecondary: COLOR.TEXT_SECONDARY,
  cream: COLOR.CREAM,
  light: COLOR.LIGHT,
};

export default function AdminContent() {
  const { data: bots = [], isLoading: botsLoading } = useBots();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();

  const isLoading = botsLoading || analyticsLoading;

  const totals = analytics?.totals;
  const convosPerBot = analytics?.convosPerBot ?? [];
  const leadsPerBot = analytics?.leadsPerBot ?? [];

  const pieData = leadsPerBot
    .filter((l) => l.total_leads > 0)
    .map((l) => ({
      name: l.bot_name,
      value: Number(l.total_leads),
    }));

  const conversionRate = totals?.total_conversations
    ? ((totals.total_leads / totals.total_conversations) * 100).toFixed(1)
    : "0.0";

  const botBarData = convosPerBot.slice(0, 6).map((c) => ({
    name: c.bot_name.length > 10 ? c.bot_name.slice(0, 10) + "…" : c.bot_name,
    Engagement: Number(c.total_conversations),
    Conversion:
      leadsPerBot.find((l) => l.bot_id === c.bot_id)?.total_leads ?? 0,
  }));

  if (isLoading) {
    return (
      <Container
        style={{
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <Loader />
      </Container>
    );
  }

  return (
    <Container>
      <DashboardWrapper
        as={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatsGrid>
          <StatCard as={motion.div} variants={itemVariants}>
            <StatCardTop>
              <StatIconBox $color={T.primary}>
                <Bot size={22} />
              </StatIconBox>
              <StatDelta $up>
                <TrendingUp size={12} /> Live
              </StatDelta>
            </StatCardTop>
            <StatValue>{bots.length}</StatValue>
            <StatLabel>Active AI Fleet</StatLabel>
          </StatCard>

          <StatCard as={motion.div} variants={itemVariants}>
            <StatCardTop>
              <StatIconBox $color={T.primaryHover}>
                <MessageSquare size={22} />
              </StatIconBox>
              <StatDelta $up>
                <Activity size={12} /> Active
              </StatDelta>
            </StatCardTop>
            <StatValue>{totals?.total_conversations ?? 0}</StatValue>
            <StatLabel>Engagement Volume</StatLabel>
          </StatCard>

          <StatCard as={motion.div} variants={itemVariants}>
            <StatCardTop>
              <StatIconBox $color={T.primary}>
                <Users size={22} />
              </StatIconBox>
              <Badge $type="primary">{conversionRate}% ROI</Badge>
            </StatCardTop>
            <StatValue>{totals?.total_leads ?? 0}</StatValue>
            <StatLabel>Lead Conversion</StatLabel>
          </StatCard>

          <StatCard as={motion.div} variants={itemVariants}>
            <StatCardTop>
              <StatIconBox $color={T.dark}>
                <Zap size={22} />
              </StatIconBox>
              <StatDelta $up>
                <ArrowUpRight size={12} /> High
              </StatDelta>
            </StatCardTop>
            <StatValue>{totals?.total_messages ?? 0}</StatValue>
            <StatLabel>Total AI Actions</StatLabel>
          </StatCard>
        </StatsGrid>

        <PanelRow style={{ gridTemplateColumns: "1.8fr 1fr" }}>
          <Panel as={motion.div} variants={itemVariants}>
            <SectionTitle>
              <Activity size={16} /> ROI Performance by Bot
            </SectionTitle>
            {botBarData.length === 0 ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: T.textSecondary,
                  fontSize: 14,
                }}
              >
                No active data yet
              </div>
            ) : (
              <ChartWrapper>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={botBarData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    barGap={8}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={`${T.border}66`}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 10,
                        fill: T.textSecondary,
                        fontWeight: 500,
                      }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 11,
                        fill: T.textSecondary,
                        fontWeight: 500,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ fill: "rgba(0,0,0,0.02)" }}
                    />
                    <Bar
                      dataKey="Engagement"
                      fill={T.primary}
                      radius={[6, 6, 0, 0]}
                      animationDuration={1500}
                    />
                    <Bar
                      dataKey="Conversion"
                      fill={T.dark}
                      radius={[6, 6, 0, 0]}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartWrapper>
            )}
          </Panel>

          <Panel as={motion.div} variants={itemVariants}>
            <SectionTitle>
              <Users size={16} /> Lead distribution
            </SectionTitle>
            {pieData.length === 0 ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: T.textSecondary,
                  fontSize: 14,
                }}
              >
                No leads distributed yet
              </div>
            ) : (
              <ChartWrapper>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={90}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={1500}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartWrapper>
            )}
          </Panel>
        </PanelRow>

        <Panel as={motion.div} variants={itemVariants}>
          <SectionTitle>
            <List size={16} /> Detailed Bot Performance
          </SectionTitle>
          <PerformanceTableWrapper>
            <PerformanceTable>
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
                        color: T.textSecondary,
                      }}
                    >
                      Start a conversation to see performance metrics.
                    </td>
                  </tr>
                ) : (
                  convosPerBot.map((row) => {
                    const leads =
                      leadsPerBot.find((l) => l.bot_id === row.bot_id)
                        ?.total_leads ?? 0;
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
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <span
                              style={{ fontWeight: 700, color: T.primaryHover }}
                            >
                              {row.total_conversations} chats
                            </span>
                            <span
                              style={{ fontSize: 11, color: T.textSecondary }}
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
                                  background: T.primary,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: 12, color: T.textSecondary }}>
                            <span style={{ display: "block" }}>
                              Month:{" "}
                              <strong>{row.conversations_this_month}</strong>
                            </span>
                            <span style={{ display: "block" }}>
                              Week:{" "}
                              <strong>{row.conversations_this_week}</strong>
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {bot && (
                            <BotListLink href={`/admin/bot/${bot.id}/edit-bot`}>
                              Manage{" "}
                              <ChevronRight
                                size={14}
                                style={{ marginLeft: 4 }}
                              />
                            </BotListLink>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </PerformanceTable>
          </PerformanceTableWrapper>
        </Panel>

        <PanelRow>
          <Panel as={motion.div} variants={itemVariants}>
            <SectionTitle>
              <Plus size={16} /> Recent Deployments
            </SectionTitle>
            {bots.length === 0 ? (
              <p style={{ fontSize: 14, color: T.textSecondary }}>
                No bots deployed yet.
              </p>
            ) : (
              [...bots]
                .sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime(),
                )
                .slice(0, 4)
                .map((bot) => (
                  <BotListItem key={bot.id}>
                    <BotListItemLeft>
                      <BotInitial>
                        {bot.name.charAt(0).toUpperCase()}
                      </BotInitial>
                      <div>
                        <BotListName>{bot.name}</BotListName>
                        <BotListDate>{formatDate(bot.created_at)}</BotListDate>
                      </div>
                    </BotListItemLeft>
                    <BotListLink href={`/admin/bot/${bot.id}/edit-bot`}>
                      Configure
                    </BotListLink>
                  </BotListItem>
                ))
            )}
          </Panel>

          <Panel as={motion.div} variants={itemVariants}>
            <SectionTitle>
              <Plus size={16} /> Quick Operations
            </SectionTitle>
            <QuickActionsGrid>
              <QuickActionCard href="/admin/new">
                <QuickActionIcon $color={T.primary}>
                  <Plus size={20} />
                </QuickActionIcon>
                <QuickActionText>
                  <QuickActionTitle>New Assistant</QuickActionTitle>
                  <QuickActionDesc>Build a custom AI agent</QuickActionDesc>
                </QuickActionText>
              </QuickActionCard>
              <QuickActionCard href="/admin/bots">
                <QuickActionIcon $color={T.primaryHover}>
                  <List size={20} />
                </QuickActionIcon>
                <QuickActionText>
                  <QuickActionTitle>Fleet Manager</QuickActionTitle>
                  <QuickActionDesc>Monitor all your bots</QuickActionDesc>
                </QuickActionText>
              </QuickActionCard>
              <QuickActionCard href="/admin/settings">
                <QuickActionIcon $color={T.dark}>
                  <Settings size={20} />
                </QuickActionIcon>
                <QuickActionText>
                  <QuickActionTitle>Control Center</QuickActionTitle>
                  <QuickActionDesc>Platform configurations</QuickActionDesc>
                </QuickActionText>
              </QuickActionCard>
            </QuickActionsGrid>
          </Panel>
        </PanelRow>
      </DashboardWrapper>
    </Container>
  );
}
