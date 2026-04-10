import { useQuery } from "@tanstack/react-query";
import { getSubscription } from "@/services/billing.api";

export const useBilling = () => {
  return useQuery({
    queryKey: ["billing"],
    queryFn: getSubscription,
    staleTime: 30_000,
  });
};
