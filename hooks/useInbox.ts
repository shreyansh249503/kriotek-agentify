import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getManualConversations,
  getConversationById,
  replyToConversation,
  closeConversation,
  toggleHitl,
} from "@/services/inbox.api";

export const useManualConversations = (filter: string = "manual") => {
  return useQuery({
    queryKey: ["manualConversations", filter],
    queryFn: () => getManualConversations(filter),
    refetchInterval: 3000,
  });
};

export const useConversationDetail = (id: string) => {
  return useQuery({
    queryKey: ["conversationDetail", id],
    queryFn: () => getConversationById(id),
    enabled: !!id,
    refetchInterval: 2000,
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

export const useToggleHitl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      toggleHitl(id, enabled),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversationDetail", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["manualConversations"] });
    },
  });
};

