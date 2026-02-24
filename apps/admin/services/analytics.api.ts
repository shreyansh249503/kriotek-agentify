import axiosInstance from "@/lib/axios";
import { AnalyticsData } from "@/types/analytics";

export const getAnalytics = async (): Promise<AnalyticsData> => {
  const { data } = await axiosInstance.get<AnalyticsData>("/api/analytics");
  return data;
};
