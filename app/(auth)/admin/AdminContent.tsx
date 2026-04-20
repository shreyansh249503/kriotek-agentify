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
import useAdminContent from "@/hooks/useAdminContent";
import useMotion from "@/hooks/useMotion";

export default function AdminContent() {
  const {
    bots,
    isLoading,
    totals,
    conversionRate,
    botBarData,
    pieData,
    convosPerBot,
    leadsPerBot,
    recentBots,
    formatDate,
  } = useAdminContent();

  const { containerVariants, itemVariants } = useMotion();

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
            title="User Interactions"
            botsLength={totals?.total_conversations ?? 0}
            icon={<ChatIcon size={24} weight="duotone" />}
            statDelta={<Activity size={12} />}
            deltaText="Active"
          />
          <StatsCard
            title="Contacts Collected"
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

        <PanelRow>
          <Panel as={motion.div} variants={itemVariants}>
            <SectionTitle>
              <Activity size={16} /> Contact Capture Performance
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
