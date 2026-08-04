import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Sidebar } from "./Sidebar";
import { supabase } from "@/lib/supabase";
import React from "react";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt || ""} />
  ),
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  usePathname: () => "/admin",
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

const mockCloseDrawer = jest.fn();
jest.mock("@/context/SidebarContext", () => ({
  useSidebar: () => ({
    isCollapsed: false,
    isDrawerOpen: false,
    closeDrawer: mockCloseDrawer,
  }),
}));

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
  },
}));

describe("Sidebar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render navigation items (Dashboard, Create Bot, Bots, Leads, Live Support, Settings)", () => {
    render(<Sidebar />);

    expect(screen.getAllByText("Dashboard")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Create Bot")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Bots")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Leads")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Live Support")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Settings")[0]).toBeInTheDocument();
  });

  it("should handle logout button click and redirect to /login", async () => {
    render(<Sidebar />);

    const logoutButtons = screen.getAllByRole("button");
    const logoutBtn = logoutButtons.find((btn) => btn.textContent?.includes("Logout"));
    expect(logoutBtn).toBeDefined();

    fireEvent.click(logoutBtn!);

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(mockCloseDrawer).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });
});
