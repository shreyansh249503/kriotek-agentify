import { motion } from "framer-motion";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Newspaper,
  BookOpen,
  Bot,
  MessageSquareShare,
  Sparkles,
  Upload,
} from "lucide-react";
import {
  Container,
  StatsGrid,
  DashboardWrapper,
  PerformanceHeader,
  PanelRow,
  Panel,
  PanelHeaderTitle,
  RecentActivityList,
  RecentActivityItem,
  ActivityIconWrapper,
  ActivityTitle,
  ActivityTimestamp,
  QuickActionsRow,
  QuickActionBtn,
  QuickActionGreenIcon,
  QuickActionLabel,
  LoadingContainer,
  PanelSubRow,
  PanelRow1,
} from "./styled";

import { Loader } from "@/components";
import {
  BarsChart,
  PerformanceTable,
  PiesChart,
  StatsCard,
} from "./components";
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
    recentActivities,
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
          <motion.div
            variants={itemVariants}
            style={{ flex: 1, minWidth: 300 }}
          >
            <BarsChart botBarData={botBarData} />
          </motion.div>

          <motion.div
            variants={itemVariants}
            style={{ flex: 1, minWidth: 300 }}
          >
            <PiesChart pieData={pieData} />
          </motion.div>
        </PanelRow>

        <PanelRow1>
          <Panel as={motion.div} variants={itemVariants}>
            <PerformanceHeader>Agent Performance</PerformanceHeader>

            <PerformanceTable
              convosPerBot={convosPerBot}
              leadsPerBot={leadsPerBot}
              bots={bots}
            />
          </Panel>

          <PanelSubRow>
            {/* Top Card: Recent Activity */}
            <Panel as={motion.div} variants={itemVariants}>
              <PanelHeaderTitle>Recent Activity</PanelHeaderTitle>

              <RecentActivityList>
                {recentActivities.map((act) => {
                  let Icon = Newspaper;
                  if (act.type === "knowledge") Icon = BookOpen;
                  else if (act.type === "bot") Icon = Bot;
                  else if (act.type === "escalation") Icon = MessageSquareShare;

                  return (
                    <RecentActivityItem key={act.id} href={act.href}>
                      <ActivityIconWrapper>
                        <Icon size={18} />
                      </ActivityIconWrapper>
                      <ActivityTitle title={act.title}>{act.title}</ActivityTitle>
                      <ActivityTimestamp>{act.timestamp}</ActivityTimestamp>
                    </RecentActivityItem>
                  );
                })}
              </RecentActivityList>
            </Panel>

            {/* Bottom Card: Quick Actions */}
            <Panel as={motion.div} variants={itemVariants}>
              <PanelHeaderTitle>Quick Actions</PanelHeaderTitle>

              <QuickActionsRow>
                <QuickActionBtn href="/admin/new">
                  <QuickActionGreenIcon>
                    <Plus size={15} strokeWidth={2.5} />
                  </QuickActionGreenIcon>
                  <QuickActionLabel>Create Bot</QuickActionLabel>
                </QuickActionBtn>

                <QuickActionBtn href="/demo">
                  <QuickActionGreenIcon>
                    <Sparkles size={15} strokeWidth={2.2} />
                  </QuickActionGreenIcon>
                  <QuickActionLabel>Custom widget</QuickActionLabel>
                </QuickActionBtn>

                <QuickActionBtn href="/admin/bots">
                  <QuickActionGreenIcon>
                    <Upload size={15} strokeWidth={2.2} />
                  </QuickActionGreenIcon>
                  <QuickActionLabel title="Upload knowledge">Upload knowl...</QuickActionLabel>
                </QuickActionBtn>
              </QuickActionsRow>
            </Panel>
          </PanelSubRow>
        </PanelRow1>
      </DashboardWrapper>
    </Container>
  );
}
