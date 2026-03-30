import { getAllLeads } from "@/services/lead.api";
import { useQuery } from "@tanstack/react-query";

export const useLeads = () => {
  return useQuery({
    queryKey: ["leads"],
    queryFn: getAllLeads,
  });
};
