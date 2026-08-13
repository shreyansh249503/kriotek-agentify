import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EmbedSuccess } from "./EmbedSuccess";

jest.mock("@phosphor-icons/react", () => ({
  CopyIcon: () => <span data-testid="copy-icon">CopyIcon</span>,
  FileJsIcon: () => <span data-testid="file-js-icon">FileJsIcon</span>,
  CodeIcon: () => <span data-testid="code-icon">CodeIcon</span>,
}));

jest.mock("@/lib/embed", () => ({
  generateEmbedScript: (pk: string) => `<script src="https://cdn.example.com/embed.js" data-key="${pk}"></script>`,
  generateReactEmbedScript: (pk: string) => `<Chatbot publicKey="${pk}" />`,
}));

describe("EmbedSuccess Component", () => {
  const mockPublicKey = "pk_test_123456789";

  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it("should render title, default HTML embed snippet, and public key", () => {
    render(<EmbedSuccess publicKey={mockPublicKey} />);

    expect(screen.getByText("Your chatbot is ready!")).toBeInTheDocument();
    expect(screen.getByText("index.html")).toBeInTheDocument();
    expect(screen.getByText(`Bot Public Key:`)).toBeInTheDocument();
    expect(screen.getByText(mockPublicKey)).toBeInTheDocument();
    expect(
      screen.getByText(`<script src="https://cdn.example.com/embed.js" data-key="${mockPublicKey}"></script>`)
    ).toBeInTheDocument();
  });

  it("should switch tabs to Next.js snippet when clicked", () => {
    render(<EmbedSuccess publicKey={mockPublicKey} />);

    const nextjsTab = screen.getByRole("button", { name: /Next.js/i });
    fireEvent.click(nextjsTab);

    expect(screen.getByText("Layout.tsx")).toBeInTheDocument();
    expect(screen.getByText(`Use this component in your Next.js application.`)).toBeInTheDocument();
    expect(screen.getByText(`<Chatbot publicKey="${mockPublicKey}" />`)).toBeInTheDocument();
  });

  it("should copy script code to clipboard when copy button is clicked", async () => {
    render(<EmbedSuccess publicKey={mockPublicKey} />);

    const copyButton = screen.getByRole("button", { name: /Copy/i });
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `<script src="https://cdn.example.com/embed.js" data-key="${mockPublicKey}"></script>`
    );
    expect(screen.getByText("Copied!")).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
      },
      { timeout: 2500 }
    );
  });
});
