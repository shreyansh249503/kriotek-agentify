import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NewBotPage from "./page";
import { useCreateBot } from "@/hooks/useBot";
import { useRouter } from "next/navigation";
import { CreateBotInput } from "@/types/bot";

jest.mock("@/hooks/useBot");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/components", () => ({
  BotForm: ({ onSubmit }: { onSubmit: (data: CreateBotInput) => void }) => (
    <form
      data-testid="mock-bot-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name: "New Test Bot" });
      }}
    >
      <button type="submit">Submit Mock Form</button>
    </form>
  ),
}));

describe("NewBotPage Component", () => {
  const mockUseCreateBot = useCreateBot as jest.Mock;
  const mockUseRouter = useRouter as jest.Mock;
  const mockPush = jest.fn();
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockUseCreateBot.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it("should render BotForm component", () => {
    render(<NewBotPage />);
    expect(screen.getByTestId("mock-bot-form")).toBeInTheDocument();
  });

  it("should trigger mutate and navigate to ingest page on success with public_key", async () => {
    mockMutate.mockImplementation((data, options) => {
      options.onSuccess({ public_key: "test_pk_123" });
    });

    render(<NewBotPage />);

    fireEvent.submit(screen.getByTestId("mock-bot-form"));

    expect(mockMutate).toHaveBeenCalledWith(
      { name: "New Test Bot" },
      expect.any(Object)
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/bots/test_pk_123/ingest");
    });
  });

  it("should navigate to /admin on success if public_key is not present", async () => {
    mockMutate.mockImplementation((data, options) => {
      options.onSuccess({});
    });

    render(<NewBotPage />);

    fireEvent.submit(screen.getByTestId("mock-bot-form"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin");
    });
  });
});
