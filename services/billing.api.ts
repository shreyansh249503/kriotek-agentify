import axiosInstance from "@/lib/axios";

export interface SubscriptionData {
  plan: string;
  status: string;
  period_end: string | null;
  messages_this_period: number;
  limits: { bots: number; messages: number; messagesPeriod: "daily" | "monthly"; pages: number };
  usage: { bots: number; messages: number; pages: number };
}

export const getSubscription = async (): Promise<SubscriptionData> => {
  const { data } = await axiosInstance.get<SubscriptionData>("/api/billing/subscription");
  return data;
};

export const createCheckoutSession = async (planId: string): Promise<{ url: string }> => {
  const { data } = await axiosInstance.post<{ url: string }>("/api/billing/checkout", { planId });
  return data;
};

export const createPortalSession = async (): Promise<{ url: string }> => {
  const { data } = await axiosInstance.post<{ url: string }>("/api/billing/portal");
  return data;
};
