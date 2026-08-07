import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TrainingPage from "./page";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockFetchWithToken = jest.fn();
jest.mock("../lib/useSessionToken", () => ({
  useSessionToken: () => ({
    fetchWithToken: mockFetchWithToken,
  }),
}));

jest.mock("@shopify/polaris", () => ({
  Page: ({
    children,
    title,
    backAction,
  }: {
    children?: React.ReactNode;
    title?: React.ReactNode;
    backAction?: { content?: React.ReactNode; onAction?: () => void };
  }) => (
    <div data-testid="polaris-page">
      <h1>{title}</h1>
      {backAction && (
        <button onClick={backAction.onAction}>{backAction.content}</button>
      )}
      {children}
    </div>
  ),
  Layout: Object.assign(
    ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    {
      Section: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    }
  ),
  Card: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  TextField: ({
    label,
    value,
    onChange,
    placeholder,
  }: {
    label?: React.ReactNode;
    value?: string;
    onChange?: (val: string) => void;
    placeholder?: string;
  }) => (
    <label>
      {label}
      <input
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
    </label>
  ),
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Banner: ({
    children,
    title,
  }: {
    children?: React.ReactNode;
    title?: React.ReactNode;
  }) => (
    <div>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  ),
  BlockStack: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  InlineStack: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
  Badge: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
  DropZone: Object.assign(
    ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    {
      FileUpload: () => <div>DropZone FileUpload</div>,
    }
  ),
  Spinner: () => <div data-testid="spinner">Spinner</div>,
  List: Object.assign(
    ({ children }: { children?: React.ReactNode }) => <ul>{children}</ul>,
    {
      Item: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
    }
  ),
}));

describe("Shopify TrainingPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render loading spinner initially", () => {
    mockFetchWithToken.mockReturnValue(new Promise(() => {}));
    render(<TrainingPage />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("should render unauthorized banner when fetch returns 401 status", async () => {
    mockFetchWithToken.mockResolvedValueOnce({
      status: 401,
      json: jest.fn(),
    });

    render(<TrainingPage />);

    await waitFor(() => {
      expect(screen.getByText("Shopify App Bridge Required")).toBeInTheDocument();
    });
  });

  it("should render training page with URL crawl form, PDF upload card, and active crawled pages list", async () => {
    const mockBotData = {
      bot: { id: "bot-123", public_key: "pk_test_key", name: "Shopify Assistant" },
      crawled_pages: [
        { id: "page-1", page_url: "https://myshop.com/pages/faq" },
        { id: "page-2", page_url: "https://myshop.com/pages/about-us" },
      ],
    };

    mockFetchWithToken.mockResolvedValueOnce({
      status: 200,
      json: async () => mockBotData,
    });

    render(<TrainingPage />);

    await waitFor(() => {
      expect(screen.getByText("Training data")).toBeInTheDocument();
      expect(screen.getByText("Crawl Website URL")).toBeInTheDocument();
      expect(screen.getByText("Upload PDF Document")).toBeInTheDocument();
      expect(screen.getByText("Crawled Pages")).toBeInTheDocument();
      expect(screen.getByText("2 active page(s)")).toBeInTheDocument();
      expect(screen.getByText("https://myshop.com/pages/faq")).toBeInTheDocument();
      expect(screen.getByText("https://myshop.com/pages/about-us")).toBeInTheDocument();
    });
  });

  it("should handle crawling a new URL", async () => {
    const mockBotData = {
      bot: { id: "bot-123", public_key: "pk_test_key", name: "Shopify Assistant" },
      crawled_pages: [],
    };

    mockFetchWithToken
      .mockResolvedValueOnce({
        status: 200,
        json: async () => mockBotData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "ok", chunksIngested: 5 }),
      })
      .mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          ...mockBotData,
          crawled_pages: [{ id: "page-1", page_url: "https://myshop.com/new-page" }],
        }),
      });

    render(<TrainingPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("https://example.com/about")).toBeInTheDocument();
    });

    const urlInput = screen.getByPlaceholderText("https://example.com/about");
    fireEvent.change(urlInput, { target: { value: "https://myshop.com/new-page" } });

    const crawlBtn = screen.getByRole("button", { name: "Crawl URL" });
    fireEvent.click(crawlBtn);

    await waitFor(() => {
      expect(mockFetchWithToken).toHaveBeenCalledWith("/api/shopify/admin/ingest-url", expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ url: "https://myshop.com/new-page" }),
      }));
      expect(screen.getByText("Crawled website successfully (indexed 5 content chunks).")).toBeInTheDocument();
    });
  });
});
