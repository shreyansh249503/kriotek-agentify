import { motion } from "framer-motion";
import {
  Users,
  Plus,
  List,
  Settings,
  ArrowUp,
  ArrowDown,
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
// import {
//   ChatIcon,
//   LightningIcon,
//   RobotIcon,
//   UsersIcon,
// } from "@phosphor-icons/react";
import useAdminContent from "@/hooks/useAdminContent";
import useMotion from "@/hooks/useMotion";

export default function AdminContent() {
  const {
    bots,
    isLoading,
    totals,
    conversionRate,
    trends,
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
            title="Total Leads"
            botsLength={totals?.total_leads ?? 87}
            statDelta={
              trends?.leadsTrend?.isUp ? (
                <ArrowUp size={14} />
              ) : (
                <ArrowDown size={14} />
              )
            }
            deltaText={trends?.leadsTrend?.percentage ?? "18.2 %"}
            isUp={trends?.leadsTrend?.isUp ?? true}
          />
          <StatsCard
            title="Conversation"
            botsLength={totals?.total_conversations ?? 560}
            statDelta={
              trends?.convosTrend?.isUp ? (
                <ArrowUp size={14} />
              ) : (
                <ArrowDown size={14} />
              )
            }
            deltaText={trends?.convosTrend?.percentage ?? "22.4 %"}
            isUp={trends?.convosTrend?.isUp ?? true}
          />
          <StatsCard
            title="Conversion Rate"
            botsLength={`${conversionRate && conversionRate !== "0.0" ? conversionRate : "32.6"}%`}
            statDelta={
              trends?.conversionRateTrend?.isUp ? (
                <ArrowUp size={14} />
              ) : (
                <ArrowDown size={14} />
              )
            }
            deltaText={trends?.conversionRateTrend?.percentage ?? "8.2 %"}
            isUp={trends?.conversionRateTrend?.isUp ?? true}
          />
          <StatsCard
            title="Token used"
            botsLength={totals?.total_messages ?? 320}
            statDelta={
              trends?.tokensTrend?.isUp ? (
                <ArrowUp size={14} />
              ) : (
                <ArrowDown size={14} />
              )
            }
            deltaText={trends?.tokensTrend?.percentage ?? "18.2 %"}
            isUp={trends?.tokensTrend?.isUp ?? true}
          />
        </StatsGrid>

        <PanelRow>
          <motion.div variants={itemVariants} style={{ flex: 1, minWidth: 300 }}>
            <BarsChart botBarData={botBarData} />
          </motion.div>

          <motion.div variants={itemVariants} style={{ flex: 1, minWidth: 300 }}>
            <PiesChart pieData={pieData} />
          </motion.div>
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
