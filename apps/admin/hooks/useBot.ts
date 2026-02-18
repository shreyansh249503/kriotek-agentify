import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBot, getBotById, updateBot } from "@/services/bot.api";
import { UpdateBotInput } from "@/types/bot";

export const useBot = (id: string) => {
  return useQuery({
    queryKey: ["bot", id],
    queryFn: () => getBotById(id),
    enabled: !!id,
  });
};

export const useCreateBot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
    },
  });
};

export const useUpdateBot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBotInput }) =>
      updateBot(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bot", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["bots"] });
    },
  });
};
