import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BotCard, formatTrainedTime } from "./BotCard";
import { Bot } from "@/types/bot";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/hooks/useBot", () => ({
  useDeleteBot: jest.fn(() => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
  })),
}));

describe("BotCard Component", () => {
  const mockUseRouter = useRouter as jest.Mock;
  const mockPush = jest.fn();

  const sampleBot: Bot = {
    id: "bot-123",
    public_key: "pk_sample_123",
    name: "Agentify's Bot",
    description: "Agentify Pvt Ltd",
    company_name: "Agentify Pvt Ltd",
    tone: "friendly",
    primary_color: "#A8E10C",
    created_at: "2026-08-10T10:00:00Z",
    updated_at: "2026-08-12T10:00:00Z",
    contact_enabled: true,
    contact_email: "support@agentify.com",
    contact_prompt: "Contact us",
    contact_email_message: "Thanks",
    logo_url: "https://example.com/logo.png",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush });
  });

  it("renders bot name, company name, logo image, and trained time", () => {
    render(
      <BotCard
        bot={sampleBot}
        lastTrained="2 min ago"
      />
    );

    const botNameElements = screen.getAllByText("Agentify's Bot");
    expect(botNameElements.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText("Agentify Pvt Ltd")).toBeInTheDocument();

    expect(screen.getByText("Last trained 2 min ago")).toBeInTheDocument();

    const images = screen.getAllByRole("img");
    expect(images[0]).toHaveAttribute("src", "https://example.com/logo.png");
  });

  it("handles lastTrained string that already includes 'Last trained' prefix", () => {
    render(
      <BotCard
        bot={sampleBot}
        lastTrained="Last trained 10 min ago"
      />
    );
    expect(screen.getByText("Last trained 10 min ago")).toBeInTheDocument();
    expect(screen.queryByText("Last trained Last trained 10 min ago")).not.toBeInTheDocument();
  });

  it("renders relative time from bot.last_trained_at", () => {
    const trainedBot: Bot = {
      ...sampleBot,
      last_trained_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    };
    render(<BotCard bot={trainedBot} />);
    expect(screen.getByText("Last trained 5 min ago")).toBeInTheDocument();
  });

  it("renders 'Not trained yet' when bot has never been ingested/trained", () => {
    const untrainedBot: Bot = {
      ...sampleBot,
      last_trained_at: null,
    };
    render(<BotCard bot={untrainedBot} />);
    expect(screen.getByText("Not trained yet")).toBeInTheDocument();
  });

  it("renders default fallback logo when logo_url is not provided", () => {
    const botWithoutLogo: Bot = {
      ...sampleBot,
      logo_url: null,
    };

    render(<BotCard bot={botWithoutLogo} />);
    expect(screen.getByLabelText("Agentify Logo")).toBeInTheDocument();
  });

  it("opens menu when 3-dots button is clicked and navigates on Edit", async () => {
    const mockOnEdit = jest.fn();
    render(<BotCard bot={sampleBot} onEdit={mockOnEdit} />);

    const menuButton = screen.getByLabelText("More options");
    fireEvent.click(menuButton);

    const editBtn = screen.getByRole("button", { name: "Edit" });
    expect(editBtn).toBeInTheDocument();

    fireEvent.click(editBtn);
    expect(mockOnEdit).toHaveBeenCalledWith(sampleBot);
  });

  it("navigates to edit route if onEdit is not provided", async () => {
    render(<BotCard bot={sampleBot} />);

    const menuButton = screen.getByLabelText("More options");
    fireEvent.click(menuButton);

    const editBtn = screen.getByRole("button", { name: "Edit" });
    fireEvent.click(editBtn);

    expect(mockPush).toHaveBeenCalledWith("/admin/bot/bot-123/edit-bot");
  });

  it("navigates on Ingest button click", async () => {
    const mockOnIngest = jest.fn();
    render(<BotCard bot={sampleBot} onIngest={mockOnIngest} />);

    const menuButton = screen.getByLabelText("More options");
    fireEvent.click(menuButton);

    const ingestBtn = screen.getByRole("button", { name: "Ingest" });
    fireEvent.click(ingestBtn);

    expect(mockOnIngest).toHaveBeenCalledWith(sampleBot);
  });

  it("handles copy public key to clipboard", async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    render(<BotCard bot={sampleBot} />);

    const menuButton = screen.getByLabelText("More options");
    fireEvent.click(menuButton);

    const copyBtn = screen.getByRole("button", { name: "Copy Key" });
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("pk_sample_123");
    await waitFor(() => {
      expect(screen.getByText("Copied Key!")).toBeInTheDocument();
    });
  });

  it("opens confirmation modal when delete option is clicked and allows cancel", () => {
    const mockOnDelete = jest.fn();
    render(<BotCard bot={sampleBot} onDelete={mockOnDelete} />);

    const menuButton = screen.getByLabelText("More options");
    fireEvent.click(menuButton);

    const deleteBtn = screen.getByRole("button", { name: "Delete" });
    expect(deleteBtn).toBeInTheDocument();

    fireEvent.click(deleteBtn);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Delete Bot")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it("confirms delete in modal and calls onDelete", async () => {
    const mockOnDelete = jest.fn().mockResolvedValue(undefined);
    render(<BotCard bot={sampleBot} onDelete={mockOnDelete} />);

    const menuButton = screen.getByLabelText("More options");
    fireEvent.click(menuButton);

    const deleteBtn = screen.getByRole("button", { name: "Delete" });
    fireEvent.click(deleteBtn);

    const confirmBtn = screen.getByRole("button", { name: "Confirm Delete" });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(sampleBot);
    });
  });

  it("closes delete confirmation modal on Escape key press", () => {
    render(<BotCard bot={sampleBot} />);

    const menuButton = screen.getByLabelText("More options");
    fireEvent.click(menuButton);

    const deleteBtn = screen.getByRole("button", { name: "Delete" });
    fireEvent.click(deleteBtn);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("formatTrainedTime helper", () => {
  it("formats relative time correctly", () => {
    expect(formatTrainedTime(undefined, "2 min ago")).toBe("2 min ago");
    expect(formatTrainedTime("invalid", "2 min ago")).toBe("2 min ago");

    const now = Date.now();
    const tenSecondsAgo = new Date(now - 10 * 1000).toISOString();
    expect(formatTrainedTime(tenSecondsAgo)).toBe("just now");

    const fiveMinAgo = new Date(now - 5 * 60 * 1000).toISOString();
    expect(formatTrainedTime(fiveMinAgo)).toBe("5 min ago");

    const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000).toISOString();
    expect(formatTrainedTime(twoHoursAgo)).toBe("2 hr ago");

    const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatTrainedTime(threeDaysAgo)).toBe("3 days ago");

    expect(formatTrainedTime("5 min ago")).toBe("5 min ago");
    expect(formatTrainedTime("Last trained 1 hr ago")).toBe("1 hr ago");

    expect(formatTrainedTime(String(now - 5 * 60 * 1000))).toBe("5 min ago");
  });
});
