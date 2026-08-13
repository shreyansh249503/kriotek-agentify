import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ShopifyDashboard from "./page";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockFetchWithToken = jest.fn();
jest.mock("./lib/useSessionToken", () => ({
  useSessionToken: () => ({
    fetchWithToken: mockFetchWithToken,
  }),
}));

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

jest.mock("@shopify/polaris", () => ({
  Page: ({
    children,
    title,
    primaryAction,
  }: {
    children?: React.ReactNode;
    title?: React.ReactNode;
    primaryAction?: { content?: React.ReactNode; onAction?: () => void };
  }) => (
    <div data-testid="polaris-page">
      <h1>{title}</h1>
      {primaryAction && (
        <button onClick={primaryAction.onAction}>{primaryAction.content}</button>
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
  Text: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
  Button: ({
    children,
    onClick,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
  Badge: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
  BlockStack: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  InlineStack: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Banner: ({ children, title }: { children?: React.ReactNode; title?: string }) => (
    <div>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  ),
  Spinner: () => <div data-testid="spinner">Spinner</div>,
  AppProvider: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

describe("ShopifyDashboard Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show loading spinner initially", () => {
    mockFetchWithToken.mockReturnValue(new Promise(() => {}));
    render(<ShopifyDashboard />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("should show unauthorized banner when fetch returns 401 status", async () => {
    mockFetchWithToken.mockResolvedValueOnce({
      status: 401,
      json: jest.fn(),
    });

    render(<ShopifyDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Shopify App Bridge Required")).toBeInTheDocument();
    });
  });

  it("should render dashboard data, stats, trend chart, and bot config actions", async () => {
    const mockDashboardData = {
      bot: {
        id: "bot-123",
        name: "Shopify Assistant",
        ecommerce_enabled: true,
        ecommerce_products: [],
      },
      stats: {
        total_conversations: 42,
        total_leads: 18,
        products_synced: 105,
      },
      trend: [
        { month: "Jan", conversations: 10, leads: 4 },
        { month: "Feb", conversations: 32, leads: 14 },
      ],
      shop: "mystore.myshopify.com",
    };

    mockFetchWithToken.mockResolvedValueOnce({
      status: 200,
      json: async () => mockDashboardData,
    });

    render(<ShopifyDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Agentify Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Conversations")).toBeInTheDocument();
      expect(screen.getByText("42")).toBeInTheDocument();
      expect(screen.getByText("Leads captured")).toBeInTheDocument();
      expect(screen.getByText("18")).toBeInTheDocument();
      expect(screen.getByText("Products synced")).toBeInTheDocument();
      expect(screen.getByText("105")).toBeInTheDocument();
      expect(screen.getByText("Performance trends")).toBeInTheDocument();
      expect(screen.getByText("Shopify Assistant")).toBeInTheDocument();
    });

    const editBotBtn = screen.getByRole("button", { name: "Edit bot" });
    fireEvent.click(editBotBtn);
    expect(mockPush).toHaveBeenCalledWith("/admin/shopify/bot");

    const viewLeadsBtn = screen.getByRole("button", { name: "View leads" });
    fireEvent.click(viewLeadsBtn);
    expect(mockPush).toHaveBeenCalledWith("/admin/shopify/leads");

    const trainingDataBtn = screen.getByRole("button", { name: "Training data" });
    fireEvent.click(trainingDataBtn);
    expect(mockPush).toHaveBeenCalledWith("/admin/shopify/training");
  });

  it("should handle Sync products action button click", async () => {
    const mockDashboardData = {
      bot: { id: "bot-123", name: "Shopify Assistant", ecommerce_enabled: true, ecommerce_products: [] },
      stats: { total_conversations: 10, total_leads: 2, products_synced: 50 },
      shop: "mystore.myshopify.com",
    };

    mockFetchWithToken
      .mockResolvedValueOnce({
        status: 200,
        json: async () => mockDashboardData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ synced: 50 }),
      })
      .mockResolvedValueOnce({
        status: 200,
        json: async () => mockDashboardData,
      });

    render(<ShopifyDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Sync products")).toBeInTheDocument();
    });

    const syncBtn = screen.getByRole("button", { name: "Sync products" });
    fireEvent.click(syncBtn);

    await waitFor(() => {
      expect(mockFetchWithToken).toHaveBeenCalledWith("/api/shopify/sync", expect.objectContaining({
        method: "POST",
      }));
      expect(screen.getByText("Synced 50 products successfully.")).toBeInTheDocument();
    });
  });

  it("should render banner when no bot is configured", async () => {
    mockFetchWithToken.mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        bot: null,
        stats: { total_conversations: 0, total_leads: 0, products_synced: 0 },
        shop: "mystore.myshopify.com",
      }),
    });

    render(<ShopifyDashboard />);

    await waitFor(() => {
      expect(screen.getByText("No bot configured yet")).toBeInTheDocument();
    });
  });
});
