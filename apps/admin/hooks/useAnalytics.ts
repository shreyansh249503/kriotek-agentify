import { useQuery } from "@tanstack/react-query";
import { getAnalytics } from "@/services/analytics.api";

export const useAnalytics = () => {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: getAnalytics,
    staleTime: 60_000,
  });
};
