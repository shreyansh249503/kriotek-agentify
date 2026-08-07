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

  const trends = useMemo(() => {
    const monthly = analytics?.monthlyTrend || [];
    let leadsChange = 18.2;
    let convosChange = 22.4;
    let conversionRateChange = 8.2;
    let tokensChange = 18.2;

    if (monthly.length >= 2) {
      const current = monthly[monthly.length - 1];
      const prev = monthly[monthly.length - 2];

      if (prev.leads > 0) {
        leadsChange = Number(
          (((current.leads - prev.leads) / prev.leads) * 100).toFixed(1),
        );
      } else if (current.leads > 0) {
        leadsChange = 100;
      }

      if (prev.conversations > 0) {
        convosChange = Number(
          (
            ((current.conversations - prev.conversations) /
              prev.conversations) *
            100
          ).toFixed(1),
        );
      } else if (current.conversations > 0) {
        convosChange = 100;
      }

      const currentCR =
        current.conversations > 0
          ? (current.leads / current.conversations) * 100
          : 0;
      const prevCR =
        prev.conversations > 0
          ? (prev.leads / prev.conversations) * 100
          : 0;
      conversionRateChange = Number((currentCR - prevCR).toFixed(1));
      tokensChange = convosChange;
    }

    return {
      leadsTrend: {
        percentage: `${Math.abs(leadsChange)} %`,
        isUp: leadsChange >= 0,
      },
      convosTrend: {
        percentage: `${Math.abs(convosChange)} %`,
        isUp: convosChange >= 0,
      },
      conversionRateTrend: {
        percentage: `${Math.abs(conversionRateChange)} %`,
        isUp: conversionRateChange >= 0,
      },
      tokensTrend: {
        percentage: `${Math.abs(tokensChange)} %`,
        isUp: tokensChange >= 0,
      },
    };
  }, [analytics]);

  const pieData = useMemo(
    () =>
      leadsPerBot
        .filter((l) => Number(l.total_leads) > 0)
        .map((l) => ({ name: l.bot_name, value: Number(l.total_leads) })),
    [leadsPerBot],
  );

  const botBarData = useMemo(() => {
    const nameCounts: Record<string, number> = {};

    return convosPerBot.slice(0, 6).map((c) => {
      const truncatedName =
        c.bot_name.length > 10 ? c.bot_name.slice(0, 10) + "…" : c.bot_name;

      const count = nameCounts[truncatedName] || 0;
      nameCounts[truncatedName] = count + 1;

      // Append zero-width space '\u200B' for duplicate bot names to ensure unique Recharts XAxis keys
      const uniqueName = truncatedName + "\u200B".repeat(count);

      const matchingLead = leadsPerBot.find(
        (l) =>
          String(l.bot_id).toLowerCase() === String(c.bot_id).toLowerCase(),
      );

      return {
        id: c.bot_id,
        name: uniqueName,
        rawName: c.bot_name,
        Interactions: Number(c.total_conversations || 0),
        ContactsCollected: Number(matchingLead?.total_leads || 0),
      };
    });
  }, [convosPerBot, leadsPerBot]);

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
    trends,
    botBarData,
    pieData,
    convosPerBot,
    leadsPerBot,
    recentBots,
    formatDate,
  };
}
export default useAdminContent;
