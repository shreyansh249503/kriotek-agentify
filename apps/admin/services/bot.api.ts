import axiosInstance from "@/lib/axios";
import { supabase } from "@/lib/supabase";
import { Bot, CreateBotInput, UpdateBotInput } from "@/types/bot";

export const getAllBots = async (): Promise<Bot[]> => {
  const { data } = await axiosInstance.get<Bot[]>(`/api/bots`);
  return data;
};

export const getBotById = async (id: string): Promise<Bot> => {
  const { data } = await axiosInstance.get<Bot>(`/api/bots/${id}`);
  return data;
};

export const createBot = async (data: CreateBotInput) => {
  const { data: response } = await axiosInstance.post("/api/bots", data);
  return response;
};

export const updateBot = async (id: string, data: UpdateBotInput) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await axiosInstance.put(`/api/bots/${id}`, data, {
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
  });

  return response.data;
};
