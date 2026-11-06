import { render, screen, fireEvent } from "@testing-library/react";
import LeadsPage from "./page";
import { useLeads } from "@/hooks/useLead";

jest.mock("@/hooks/useLead");
jest.mock("@/components", () => {
  const original = jest.requireActual("@/components");
  return {
    ...original,
    SearchBar: ({
      onSearch,
      placeholder,
    }: {
      onSearch: (q: string) => void;
      placeholder?: string;
    }) => (
      <input
        placeholder={placeholder || "Search..."}
        onChange={(e) => onSearch(e.target.value)}
      />
    ),
  };
});

describe("LeadsPage Component", () => {
  const mockUseLeads = useLeads as jest.Mock;

  const mockLeads = [
    {
      id: "lead-1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      bot_name: "Sales Bot",
      created_at: "2026-01-01T10:00:00Z",
    },
    {
      id: "lead-2",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+0987654321",
      bot_name: "Support Bot",
      created_at: "2026-01-02T10:00:00Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render loading state when query is loading", () => {
    mockUseLeads.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { container } = render(<LeadsPage />);
    expect(container).toBeInTheDocument();
  });

  it("should render leads table and filter by search term", () => {
    mockUseLeads.mockReturnValue({
      data: mockLeads,
      isLoading: false,
    });

    render(<LeadsPage />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Sales Bot")).toBeInTheDocument();

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("Support Bot")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("Search leads...");
    fireEvent.change(searchInput, { target: { value: "John" } });

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
  });

  it("should render empty state when search returns no matches", () => {
    mockUseLeads.mockReturnValue({
      data: mockLeads,
      isLoading: false,
    });

    render(<LeadsPage />);

    const searchInput = screen.getByPlaceholderText("Search leads...");
    fireEvent.change(searchInput, { target: { value: "NonExistent" } });

    expect(
      screen.getByText('No leads found matching "NonExistent"'),
    ).toBeInTheDocument();
  });

  it("should sort leads by date ascending and descending", () => {
    mockUseLeads.mockReturnValue({
      data: mockLeads,
      isLoading: false,
    });

    render(<LeadsPage />);

    const rowsInitial = screen.getAllByTestId("lead-row");
    expect(rowsInitial[0]).toHaveTextContent("Jane Smith");
    expect(rowsInitial[1]).toHaveTextContent("John Doe");

    const dateHeader = screen.getByTestId("sort-date-header");
    fireEvent.click(dateHeader);

    const rowsSortedAsc = screen.getAllByTestId("lead-row");
    expect(rowsSortedAsc[0]).toHaveTextContent("John Doe");
    expect(rowsSortedAsc[1]).toHaveTextContent("Jane Smith");

    const sortSelect = screen.getByTestId("sort-order-select");
    fireEvent.change(sortSelect, { target: { value: "desc" } });

    const rowsSortedDesc = screen.getAllByTestId("lead-row");
    expect(rowsSortedDesc[0]).toHaveTextContent("Jane Smith");
    expect(rowsSortedDesc[1]).toHaveTextContent("John Doe");
  });

  it("should handle CSV export without crashing", () => {
    const createObjectURLMock = jest.fn().mockReturnValue("blob:mock-url");
    const revokeObjectURLMock = jest.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    mockUseLeads.mockReturnValue({
      data: mockLeads,
      isLoading: false,
    });

    render(<LeadsPage />);

    const exportBtn = screen.getByTestId("export-csv-btn");
    expect(exportBtn).toBeEnabled();

    fireEvent.click(exportBtn);

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalled();
  });
});

