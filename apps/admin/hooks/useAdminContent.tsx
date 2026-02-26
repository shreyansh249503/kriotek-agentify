import { useAnalytics } from "@/hooks/useAnalytics";
import { useBots } from "@/hooks/useBot";
import { useMemo } from "react";

function useAdminContent() {
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
        Interactions: Number(c.total_conversations),
        ContactsCollected:
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
    
    const formatDate = (date: string | Date) =>
      date
        ? new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "";

  return {
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
  };
}
export default useAdminContent;
