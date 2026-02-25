"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  List,
  Settings,
  ArrowUpRight,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  Container,
  StatsGrid,
  DashboardWrapper,
  SectionTitle,
  PanelRow,
  Panel,
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
  LoadingContainer,
  EmptyChart,
} from "./styled";

import { useBots } from "@/hooks/useBot";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Loader } from "@/components";
import {
  BarsChart,
  PerformanceTable,
  PiesChart,
  StatsCard,
} from "./components";
import { COLOR } from "@/styles";
import {
  ChatIcon,
  LightningIcon,
  RobotIcon,
  UsersIcon,
} from "@phosphor-icons/react";
// import { BotConvoStat, BotLeadStat } from "@/types/analytics";

// type Totals = {
//   total_conversations: number;
//   total_leads: number;
//   total_messages: number;
// };

// type AnalyticsResponse = {
//   totals: Totals;
//   convosPerBot: BotConvoStat[];
//   leadsPerBot: BotLeadStat[];
// };

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

const formatDate = (date: string | Date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

export default function AdminContent() {
  const { data: bots = [], isLoading: botsLoading } = useBots();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();

  const isLoading = botsLoading || analyticsLoading;

  const { totals, convosPerBot, leadsPerBot } = useMemo(() => {
    return {
      totals: analytics?.totals,
      convosPerBot: analytics?.convosPerBot ?? [],
      leadsPerBot: analytics?.leadsPerBot ?? [],
    };
  }, [analytics]);

  const conversionRate = useMemo(
    () =>
      totals?.total_conversations
        ? ((totals.total_leads / totals.total_conversations) * 100).toFixed(1)
        : "0.0",
    [totals],
  );

  const pieData = useMemo(
    () =>
      leadsPerBot
        .filter((l) => l.total_leads > 0)
        .map((l) => ({ name: l.bot_name, value: Number(l.total_leads) })),
    [leadsPerBot],
  );

  const botBarData = useMemo(
    () =>
      convosPerBot.slice(0, 6).map((c) => ({
        name:
          c.bot_name.length > 10 ? c.bot_name.slice(0, 10) + "…" : c.bot_name,
        Engagement: Number(c.total_conversations),
        Conversion:
          leadsPerBot.find((l) => l.bot_id === c.bot_id)?.total_leads ?? 0,
      })),
    [convosPerBot, leadsPerBot],
  );

  const recentBots = useMemo(
    () =>
      [...bots]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 4),
    [bots],
  );

  if (isLoading) {
    return (
      <LoadingContainer>
        <Loader />
      </LoadingContainer>
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
          <StatsCard
            title="Total Bots"
            botsLength={bots.length}
            icon={<RobotIcon size={24} weight="duotone" />}
            statDelta={<TrendingUp size={12} />}
            deltaText="Live"
          />
          <StatsCard
            title="Engagement Volume"
            botsLength={totals?.total_conversations ?? 0}
            icon={<ChatIcon size={24} weight="duotone" />}
            statDelta={<Activity size={12} />}
            deltaText="Active"
          />
          <StatsCard
            title="Qualified Leads"
            botsLength={totals?.total_leads ?? 0}
            icon={<UsersIcon size={24} weight="duotone" />}
            statDelta={<TrendingUp size={12} />}
            deltaText={`${conversionRate}% ROI`}
          />
          <StatsCard
            title="Total AI Actions"
            botsLength={totals?.total_messages ?? 0}
            icon={<LightningIcon size={24} weight="duotone" />}
            statDelta={<ArrowUpRight size={12} />}
            deltaText="High"
          />
        </StatsGrid>

        <PanelRow style={{ gridTemplateColumns: "1.8fr 1fr" }}>
          <Panel as={motion.div} variants={itemVariants}>
            <SectionTitle>
              <Activity size={16} /> ROI Performance by Bot
            </SectionTitle>
            {botBarData.length ? (
              <BarsChart botBarData={botBarData} />
            ) : (
              <EmptyChart>No active data yet</EmptyChart>
            )}
          </Panel>

          <Panel as={motion.div} variants={itemVariants}>
            <SectionTitle>
              <Users size={16} /> Lead distribution
            </SectionTitle>
            {pieData.length ? (
              <PiesChart pieData={pieData} />
            ) : (
              <EmptyChart>No leads distributed yet</EmptyChart>
            )}
          </Panel>
        </PanelRow>

        <Panel as={motion.div} variants={itemVariants}>
          <SectionTitle>
            <List size={16} /> Detailed Bot Performance
          </SectionTitle>

          <PerformanceTable
            convosPerBot={convosPerBot}
            leadsPerBot={leadsPerBot}
            bots={bots}
          />
        </Panel>

        <PanelRow>
          <Panel as={motion.div} variants={itemVariants}>
            <SectionTitle>
              <Plus size={16} /> Recent Deployments
            </SectionTitle>

            {!recentBots.length ? (
              <p style={{ fontSize: 14, color: COLOR.TEXT_SECONDARY }}>
                No bots deployed yet.
              </p>
            ) : (
              recentBots.map((bot) => (
                <BotListItem key={bot.id}>
                  <BotListItemLeft>
                    <BotInitial>{bot.name[0].toUpperCase()}</BotInitial>
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
              {[
                {
                  href: "/admin/new",
                  icon: <Plus size={20} />,
                  title: "New Assistant",
                  desc: "Build a custom AI agent",
                  color: COLOR.PRIMARY,
                },
                {
                  href: "/admin/bots",
                  icon: <List size={20} />,
                  title: "Fleet Manager",
                  desc: "Monitor all your bots",
                  color: COLOR.PRIMARY_HOVER,
                },
                {
                  href: "/admin/settings",
                  icon: <Settings size={20} />,
                  title: "Control Center",
                  desc: "Platform configurations",
                  color: COLOR.DARK,
                },
              ].map((a) => (
                <QuickActionCard key={a.href} href={a.href}>
                  <QuickActionIcon $color={a.color}>{a.icon}</QuickActionIcon>
                  <QuickActionText>
                    <QuickActionTitle>{a.title}</QuickActionTitle>
                    <QuickActionDesc>{a.desc}</QuickActionDesc>
                  </QuickActionText>
                </QuickActionCard>
              ))}
            </QuickActionsGrid>
          </Panel>
        </PanelRow>
      </DashboardWrapper>
    </Container>
  );
}
