export interface BotConvoStat {
  bot_id: string;
  bot_name: string;
  total_conversations: number;
  total_messages: number;
  conversations_this_week: number;
  conversations_this_month: number;
}

export interface BotLeadStat {
  bot_id: string;
  bot_name: string;
  total_leads: number;
}

export interface MonthlyTrend {
  month: string;
  conversations: number;
  leads: number;
}

export interface AnalyticsTotals {
  total_conversations: number;
  total_messages: number;
  total_leads: number;
}

export interface AnalyticsData {
  convosPerBot: BotConvoStat[];
  leadsPerBot: BotLeadStat[];
  monthlyTrend: MonthlyTrend[];
  totals: AnalyticsTotals;
}
