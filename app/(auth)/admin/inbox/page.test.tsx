import { render, screen, fireEvent, act } from "@testing-library/react";
import InboxPage from "./page";
import {
  useManualConversations,
  useConversationDetail,
  useReplyToConversation,
  useCloseConversation,
} from "@/hooks/useInbox";
import { supabase } from "@/lib/supabase";
import React from "react";

jest.mock("@/hooks/useInbox");
jest.mock("@/lib/supabase", () => ({
  supabase: {
    channel: jest.fn(),
  },
}));
jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
}));

describe("InboxPage Component", () => {
  const mockUseManualConversations = useManualConversations as jest.Mock;
  const mockUseConversationDetail = useConversationDetail as jest.Mock;
  const mockUseReplyToConversation = useReplyToConversation as jest.Mock;
  const mockUseCloseConversation = useCloseConversation as jest.Mock;

  const mockReplyMutateAsync = jest.fn();
  const mockCloseMutateAsync = jest.fn();

  const mockConvos = [
    {
      id: "convo-1",
      name: "Alice",
      email: "alice@example.com",
      phone: "+123456789",
      bot_name: "Support Bot",
      snippet: "Hello, I need help",
      created_at: "2026-01-01T12:00:00Z",
    },
  ];

  const mockDetail = {
    messages: [
      {
        role: "user",
        content: "Hello, I need help",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (supabase.channel as jest.Mock).mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }),
    });

    mockReplyMutateAsync.mockResolvedValue({});
    mockCloseMutateAsync.mockResolvedValue({});

    mockUseReplyToConversation.mockReturnValue({
      mutateAsync: mockReplyMutateAsync,
      isPending: false,
    });

    mockUseCloseConversation.mockReturnValue({
      mutateAsync: mockCloseMutateAsync,
      isPending: false,
    });

    Element.prototype.scrollIntoView = jest.fn();
  });

  it("should render empty state when no manual conversations exist", () => {
    mockUseManualConversations.mockReturnValue({
      data: [],
      isLoading: false,
    });
    mockUseConversationDetail.mockReturnValue({
      data: null,
      isLoading: false,
    });

    render(<InboxPage />);

    expect(screen.getByText("No active support requests")).toBeInTheDocument();
  });

  it("should render conversation list and active conversation details", () => {
    mockUseManualConversations.mockReturnValue({
      data: mockConvos,
      isLoading: false,
    });
    mockUseConversationDetail.mockReturnValue({
      data: mockDetail,
      isLoading: false,
    });

    render(<InboxPage />);

    expect(screen.getAllByText("Alice")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Hello, I need help")[0]).toBeInTheDocument();
  });

  it("should handle sending a reply", async () => {
    mockUseManualConversations.mockReturnValue({
      data: mockConvos,
      isLoading: false,
    });
    mockUseConversationDetail.mockReturnValue({
      data: mockDetail,
      isLoading: false,
    });

    render(<InboxPage />);

    const input = screen.getByPlaceholderText("Type your reply to customer...");
    fireEvent.change(input, { target: { value: "Sure, how can I assist?" } });

    const submitButton =
      input.nextElementSibling || screen.getByRole("button", { name: "" });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(mockReplyMutateAsync).toHaveBeenCalledWith({
      id: "convo-1",
      message: "Sure, how can I assist?",
    });
  });

  it("should handle closing a conversation", async () => {
    mockUseManualConversations.mockReturnValue({
      data: mockConvos,
      isLoading: false,
    });
    mockUseConversationDetail.mockReturnValue({
      data: mockDetail,
      isLoading: false,
    });

    render(<InboxPage />);

    const closeButton = screen.getByRole("button", {
      name: /Mark Resolved \/ Revert to AI/i,
    });

    await act(async () => {
      fireEvent.click(closeButton);
    });

    expect(mockCloseMutateAsync).toHaveBeenCalledWith("convo-1");
  });
});
