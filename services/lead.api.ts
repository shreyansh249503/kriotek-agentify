import axiosInstance from "@/lib/axios";

export interface Lead {
  id: string;
  bot_id: string;
  name: string;
  email: string;
  phone: string;
  bot_name: string;
  created_at: string;
}

export const getAllLeads = async (): Promise<Lead[]> => {
  const { data } = await axiosInstance.get<Lead[]>(`/api/leads`);
  return data;
};
