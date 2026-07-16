import axiosInstance from "@/lib/axios";

export interface ConversationInfo {
  id: string;
  bot_id: string;
  bot_name: string;
  state: string;
  name?: string;
  email?: string;
  phone?: string;
  snippet?: string;
  created_at: string;
}

export interface ConversationDetail {
  state: string;
  messages: Array<{
    role: "user" | "assistant" | "system";
    sender?: "ai" | "human";
    content: string;
  }>;
}

export const getManualConversations = async (): Promise<ConversationInfo[]> => {
  const { data } = await axiosInstance.get<ConversationInfo[]>("/api/admin/conversations");
  return data;
};

export const getConversationById = async (id: string): Promise<ConversationDetail> => {
  const { data } = await axiosInstance.get<ConversationDetail>(`/api/admin/conversations/${id}`);
  return data;
};

export const replyToConversation = async (id: string, message: string): Promise<void> => {
  await axiosInstance.post(`/api/admin/conversations/${id}/reply`, { message });
};

export const closeConversation = async (id: string): Promise<void> => {
  await axiosInstance.post(`/api/admin/conversations/${id}/close`);
};
