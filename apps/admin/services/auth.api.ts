import axiosInstance from "@/lib/axios";

export const getCurrentUser = async () => {
  const { data } = await axiosInstance.get("/api/me");
  return data;
};
