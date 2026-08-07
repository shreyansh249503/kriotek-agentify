import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LeadsPage from "./page";

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
    primaryAction,
    backAction,
  }: {
    children?: React.ReactNode;
    title?: React.ReactNode;
    primaryAction?: { content?: React.ReactNode; onAction?: () => void };
    backAction?: { content?: React.ReactNode; onAction?: () => void };
  }) => (
    <div data-testid="polaris-page">
      <h1>{title}</h1>
      {primaryAction && (
        <button onClick={primaryAction.onAction}>{primaryAction.content}</button>
      )}
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
  DataTable: ({
    headings,
    rows,
  }: {
    headings: React.ReactNode[];
    rows: React.ReactNode[][];
  }) => (
    <table>
      <thead>
        <tr>
          {headings.map((h: React.ReactNode, i: number) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r: React.ReactNode[], i: number) => (
          <tr key={i}>
            {r.map((cell: React.ReactNode, j: number) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
  EmptyState: ({
    children,
    heading,
    action,
  }: {
    children?: React.ReactNode;
    heading?: string;
    action?: { content?: React.ReactNode; onAction?: () => void };
  }) => (
    <div>
      <h3>{heading}</h3>
      {children}
      {action && <button onClick={action.onAction}>{action.content}</button>}
    </div>
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
  Spinner: () => <div data-testid="spinner">Spinner</div>,
  Text: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
}));

describe("Shopify LeadsPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render loading spinner initially", () => {
    mockFetchWithToken.mockReturnValue(new Promise(() => {}));
    render(<LeadsPage />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("should show unauthorized banner when fetch returns 401", async () => {
    mockFetchWithToken.mockResolvedValueOnce({
      status: 401,
      json: jest.fn(),
    });

    render(<LeadsPage />);

    await waitFor(() => {
      expect(screen.getByText("Shopify App Bridge Required")).toBeInTheDocument();
    });
  });

  it("should render EmptyState when leads list is empty", async () => {
    mockFetchWithToken.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ leads: [] }),
    });

    render(<LeadsPage />);

    await waitFor(() => {
      expect(screen.getByText("No leads yet")).toBeInTheDocument();
      expect(screen.getByText("Configure Bot Settings")).toBeInTheDocument();
    });

    const ctaBtn = screen.getByRole("button", { name: "Configure Bot Settings" });
    fireEvent.click(ctaBtn);
    expect(mockPush).toHaveBeenCalledWith("/admin/shopify/bot");
  });

  it("should render leads table and trigger CSV export when Export CSV is clicked", async () => {
    const mockLeadsData = [
      {
        id: "lead-1",
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "+1234567890",
        created_at: "2026-02-01T10:00:00Z",
      },
      {
        id: "lead-2",
        name: "John Smith",
        email: "john@example.com",
        phone: null,
        created_at: "2026-02-02T12:00:00Z",
      },
    ];

    mockFetchWithToken.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ leads: mockLeadsData }),
    });

    const mockCreateObjectUrl = jest.fn(() => "blob:http://localhost/test");
    const mockRevokeObjectUrl = jest.fn();
    global.URL.createObjectURL = mockCreateObjectUrl;
    global.URL.revokeObjectURL = mockRevokeObjectUrl;

    render(<LeadsPage />);

    await waitFor(() => {
      expect(screen.getByText("2 leads captured")).toBeInTheDocument();
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
      expect(screen.getByText("John Smith")).toBeInTheDocument();
    });

    const exportBtn = screen.getByRole("button", { name: "Export CSV" });
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(mockCreateObjectUrl).toHaveBeenCalled();
    });
  });
});
