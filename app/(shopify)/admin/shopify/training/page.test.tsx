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

/** The file the mocked DropZone hands to onDrop when "Drop test file" is clicked. */
const mockDrop: { file: File | null } = { file: null };

function pdfOfSize(size: number, name = "manual.pdf") {
  const file = new File(["%PDF-1.4"], name, { type: "application/pdf" });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

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
    ({
      children,
      onDrop,
    }: {
      children?: React.ReactNode;
      onDrop?: (files: File[], accepted: File[], rejected: File[]) => void;
    }) => (
      <div>
        {children}
        <button
          onClick={() =>
            mockDrop.file && onDrop?.([mockDrop.file], [mockDrop.file], [])
          }
        >
          Drop test file
        </button>
      </div>
    ),
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

  describe("PDF upload size check", () => {
    const loadPage = async () => {
      mockFetchWithToken.mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          bot: { id: "bot-123", public_key: "pk_test_key", name: "Shopify Assistant" },
          crawled_pages: [],
        }),
      });
      render(<TrainingPage />);
      await waitFor(() => expect(screen.getByText("Upload PDF Document")).toBeInTheDocument());
    };

    afterEach(() => {
      mockDrop.file = null;
    });

    it("rejects an oversized PDF as soon as it's dropped, without uploading it", async () => {
      await loadPage();
      mockDrop.file = pdfOfSize(6 * 1024 * 1024, "catalog.pdf");

      fireEvent.click(screen.getByRole("button", { name: "Drop test file" }));

      expect(
        screen.getByText("PDF is too large. The limit is 4 MB. This file is 6.0 MB."),
      ).toBeInTheDocument();
      expect(screen.queryByText(/catalog\.pdf/)).toBeNull();
      expect(screen.queryByRole("button", { name: "Upload PDF" })).toBeNull();
      expect(mockFetchWithToken).toHaveBeenCalledTimes(1);
    });

    it("keeps a PDF under the limit and uploads it", async () => {
      await loadPage();
      mockDrop.file = pdfOfSize(900 * 1024, "faq.pdf");
      mockFetchWithToken.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "ok", chunks: 3 }),
      });

      fireEvent.click(screen.getByRole("button", { name: "Drop test file" }));
      expect(screen.getByText("(900 KB)")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Upload PDF" }));

      await waitFor(() => {
        expect(mockFetchWithToken).toHaveBeenCalledWith(
          "/api/ingest-pdf",
          expect.objectContaining({ method: "POST" }),
        );
        expect(
          screen.getByText('"faq.pdf" uploaded and indexed successfully (3 chunks).'),
        ).toBeInTheDocument();
      });
    });
  });
});
