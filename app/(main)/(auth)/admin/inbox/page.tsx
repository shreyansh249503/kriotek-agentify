"use client";

import { useState, useRef, useEffect } from "react";
import {
  InboxContainer,
  SidebarPanel,
  SidebarHeader,
  FilterTabsContainer,
  FilterTab,
  ConversationsList,
  ConvoItem,
  ConvoMeta,
  ConvoName,
  ConvoSnippet,
  ConvoDate,
  ConvoBotBadge,
  ConvoStatusBadge,
  ChatPanel,
  ChatHeader,
  ChatHeaderInfo,
  ChatHeaderName,
  ChatHeaderMeta,
  ChatHeaderActions,
  ChatHeaderButtonGroup,
  HitlToggleButton,
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
  useToggleHitl,
} from "@/hooks/useInbox";
import {
  ChatIcon,
  UserIcon,
  PaperPlaneRightIcon,
  PauseIcon,
  PlayIcon,
} from "@phosphor-icons/react";
import { Loader } from "@/components";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export default function InboxPage() {
  const [filter, setFilter] = useState<"manual" | "all" | "ai" | "resolved">("manual");
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const { data: convos = [], isLoading: listLoading } = useManualConversations(filter);

  const activeConvoId = (selectedConvoId && convos.some((c) => c.id === selectedConvoId))
    ? selectedConvoId
    : (convos.length > 0 ? convos[0].id : null);

  const { data: convoDetail, isLoading: detailLoading } = useConversationDetail(activeConvoId || "");

  const replyMutation = useReplyToConversation();
  const closeMutation = useCloseConversation();
  const toggleHitlMutation = useToggleHitl();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convoDetail?.messages]);

  // Real-time listener to conversation list changes
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

  // Real-time listener for the active conversation details
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
  const isHitlActive = activeConvo?.state === "manual" || activeConvo?.state === "manual_takeover";

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

  const handleToggleHitl = async () => {
    if (!activeConvoId) return;
    try {
      await toggleHitlMutation.mutateAsync({
        id: activeConvoId,
        enabled: !isHitlActive,
      });
    } catch (err) {
      console.error("Failed to toggle HITL", err);
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

        <FilterTabsContainer>
          <FilterTab
            $active={filter === "manual"}
            onClick={() => setFilter("manual")}
          >
            Live Queue
          </FilterTab>
          <FilterTab
            $active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All
          </FilterTab>
          <FilterTab
            $active={filter === "ai"}
            onClick={() => setFilter("ai")}
          >
            AI Active
          </FilterTab>
          <FilterTab
            $active={filter === "resolved"}
            onClick={() => setFilter("resolved")}
          >
            Resolved
          </FilterTab>
        </FilterTabsContainer>

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
                <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "2px", flexWrap: "wrap" }}>
                  <ConvoBotBadge>{convo.bot_name || "AI Agent"}</ConvoBotBadge>
                  <ConvoStatusBadge
                    data-testid="convo-status-badge"
                    $status={convo.state}
                    data-status={convo.state === "manual" ? "manual_takeover" : (convo.state || "manual_takeover")}
                  >
                    {convo.state === "manual" ? "manual_takeover" : (convo.state || "manual_takeover")}
                  </ConvoStatusBadge>
                </div>
              </ConvoItem>
            ))
          )}
        </ConversationsList>
      </SidebarPanel>

      {activeConvoId && activeConvo ? (
        <ChatPanel>
          <ChatHeader>
            <ChatHeaderInfo>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <ChatHeaderName>{activeConvo.name || "Anonymous Guest"}</ChatHeaderName>
                <ConvoStatusBadge
                  data-testid="active-convo-status-badge"
                  $status={activeConvo.state}
                  data-status={activeConvo.state === "manual" ? "manual_takeover" : (activeConvo.state || "manual_takeover")}
                >
                  {activeConvo.state === "manual" ? "manual_takeover" : (activeConvo.state || "manual_takeover")}
                </ConvoStatusBadge>
              </div>
              <ChatHeaderMeta>
                {activeConvo.email && <span>📧 {activeConvo.email}</span>}
                {activeConvo.phone && <span>📞 {activeConvo.phone}</span>}
              </ChatHeaderMeta>
            </ChatHeaderInfo>
            <ChatHeaderActions>
              <ChatHeaderButtonGroup>
                <HitlToggleButton
                  $isHitlActive={isHitlActive}
                  disabled={toggleHitlMutation.isPending}
                  onClick={handleToggleHitl}
                  title={isHitlActive ? "Resume AI Agent" : "Pause AI Agent and Take Over Chat"}
                >
                  {isHitlActive ? (
                    <>
                      <PlayIcon size={16} weight="bold" />
                      <span>{toggleHitlMutation.isPending ? "Updating..." : "Resume AI"}</span>
                    </>
                  ) : (
                    <>
                      <PauseIcon size={16} weight="bold" />
                      <span>{toggleHitlMutation.isPending ? "Updating..." : "Pause AI & Take Over"}</span>
                    </>
                  )}
                </HitlToggleButton>
                <CloseButton
                  disabled={closeMutation.isPending}
                  onClick={handleResolve}
                >
                  {closeMutation.isPending ? "Closing..." : "Mark Resolved / Revert to AI"}
                </CloseButton>
              </ChatHeaderButtonGroup>
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

