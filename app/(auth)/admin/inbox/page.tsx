"use client";

import { useState, useRef, useEffect } from "react";
import {
  InboxContainer,
  SidebarPanel,
  SidebarHeader,
  ConversationsList,
  ConvoItem,
  ConvoMeta,
  ConvoName,
  ConvoSnippet,
  ConvoDate,
  ConvoBotBadge,
  ChatPanel,
  ChatHeader,
  ChatHeaderInfo,
  ChatHeaderName,
  ChatHeaderMeta,
  ChatHeaderActions,
  CloseButton,
  MessagesArea,
  MessageRow,
  MessageBubble,
  MessageText,
  SystemMessage,
  InputArea,
  InputForm,
  InputField,
  SendButton,
  EmptyStateContainer,
  EmptyStateTitle,
  EmptyStateDesc,
} from "./styled";
import {
  useManualConversations,
  useConversationDetail,
  useReplyToConversation,
  useCloseConversation,
} from "@/hooks/useInbox";
import { ChatIcon, UserIcon, PaperPlaneRightIcon } from "@phosphor-icons/react";
import { Loader } from "@/components";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export default function InboxPage() {
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const { data: convos = [], isLoading: listLoading } = useManualConversations();

  const activeConvoId = (selectedConvoId && convos.some((c) => c.id === selectedConvoId))
    ? selectedConvoId
    : (convos.length > 0 ? convos[0].id : null);

  const { data: convoDetail, isLoading: detailLoading } = useConversationDetail(activeConvoId || "");

  const replyMutation = useReplyToConversation();
  const closeMutation = useCloseConversation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convoDetail?.messages]);

  // Listen to manual conversations list changes
  useEffect(() => {
    const channel = supabase
      .channel("inbox-conversations-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["manualConversations"] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  // Listen to updates on the active conversation
  useEffect(() => {
    if (!activeConvoId) return;

    const channel = supabase
      .channel(`inbox-convo-${activeConvoId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `id=eq.${activeConvoId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["conversationDetail", activeConvoId] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [activeConvoId, queryClient]);

  const activeConvo = convos.find((c) => c.id === activeConvoId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConvoId || !replyText.trim()) return;

    try {
      await replyMutation.mutateAsync({
        id: activeConvoId,
        message: replyText.trim(),
      });
      setReplyText("");
    } catch (err) {
      console.error("Failed to send reply", err);
    }
  };

  const handleResolve = async () => {
    if (!activeConvoId) return;

    try {
      await closeMutation.mutateAsync(activeConvoId);
      setSelectedConvoId(null);
    } catch (err) {
      console.error("Failed to close conversation", err);
    }
  };



  if (listLoading) {
    return (
      <EmptyStateContainer>
        <Loader />
        <EmptyStateTitle>Loading conversations...</EmptyStateTitle>
      </EmptyStateContainer>
    );
  }

  return (
    <InboxContainer>
      <SidebarPanel>
        <SidebarHeader>
          <ChatIcon size={20} weight="bold" />
          <span>Active Handovers ({convos.length})</span>
        </SidebarHeader>

        <ConversationsList>
          {convos.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#6b7280", fontSize: "14px" }}>
              No active support requests
            </div>
          ) : (
            convos.map((convo) => (
              <ConvoItem
                key={convo.id}
                $active={convo.id === activeConvoId}
                onClick={() => setSelectedConvoId(convo.id)}
              >
                <ConvoMeta>
                  <ConvoName>{convo.name || "Anonymous Guest"}</ConvoName>
                  <ConvoDate>
                    {new Date(convo.created_at).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </ConvoDate>
                </ConvoMeta>
                <ConvoSnippet>{convo.snippet || "Opened live chat..."}</ConvoSnippet>
                <ConvoBotBadge>{convo.bot_name || "AI Agent"}</ConvoBotBadge>
              </ConvoItem>
            ))
          )}
        </ConversationsList>
      </SidebarPanel>

      {activeConvoId && activeConvo ? (
        <ChatPanel>
          <ChatHeader>
            <ChatHeaderInfo>
              <ChatHeaderName>{activeConvo.name || "Anonymous Guest"}</ChatHeaderName>
              <ChatHeaderMeta>
                {activeConvo.email && <span>📧 {activeConvo.email}</span>}
                {activeConvo.phone && <span>📞 {activeConvo.phone}</span>}
              </ChatHeaderMeta>
            </ChatHeaderInfo>
            <ChatHeaderActions>
              <CloseButton
                disabled={closeMutation.isPending}
                onClick={handleResolve}
              >
                {closeMutation.isPending ? "Closing..." : "Mark Resolved / Revert to AI"}
              </CloseButton>
            </ChatHeaderActions>
          </ChatHeader>

          <MessagesArea>
            {detailLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
                <Loader />
              </div>
            ) : (
              convoDetail?.messages.map((msg, index) => {
                if (msg.role === "system") {
                  return <SystemMessage key={index}>{msg.content}</SystemMessage>;
                }
                const isOwn = msg.role === "assistant" && msg.sender === "human";
                return (
                  <MessageRow key={index} $isOwn={isOwn}>
                    <MessageBubble $isOwn={isOwn}>
                      <MessageText>{msg.content.replace("[SHOW_SUPPORT_BUTTON]", "")}</MessageText>
                    </MessageBubble>
                  </MessageRow>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </MessagesArea>

          <InputArea>
            <InputForm onSubmit={handleSend}>
              <InputField
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply to customer..."
                disabled={replyMutation.isPending}
              />
              <SendButton
                type="submit"
                disabled={replyMutation.isPending || !replyText.trim()}
              >
                {replyMutation.isPending ? (
                  "..."
                ) : (
                  <PaperPlaneRightIcon size={20} weight="fill" />
                )}
              </SendButton>
            </InputForm>
          </InputArea>
        </ChatPanel>
      ) : (
        <EmptyStateContainer>
          <div style={{ backgroundColor: "#f3f4f6", padding: "20px", borderRadius: "50%", display: "flex" }}>
            <UserIcon size={40} weight="bold" />
          </div>
          <EmptyStateTitle>Select a Support Chat</EmptyStateTitle>
          <EmptyStateDesc>
            Select an active customer handover conversation from the sidebar to start live chatting with the user.
          </EmptyStateDesc>
        </EmptyStateContainer>
      )}
    </InboxContainer>
  );
}
