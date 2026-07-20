import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getManualConversations,
  getConversationById,
  replyToConversation,
  closeConversation,
} from "@/services/inbox.api";

export const useManualConversations = () => {
  return useQuery({
    queryKey: ["manualConversations"],
    queryFn: getManualConversations,
  });
};

export const useConversationDetail = (id: string) => {
  return useQuery({
    queryKey: ["conversationDetail", id],
    queryFn: () => getConversationById(id),
    enabled: !!id,
  });
};

export const useReplyToConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      replyToConversation(id, message),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversationDetail", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["manualConversations"] });
    },
  });
};

export const useCloseConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => closeConversation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["conversationDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["manualConversations"] });
    },
  });
};
