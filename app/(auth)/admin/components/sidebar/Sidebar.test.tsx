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
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: {
            email: "rishabh2552002@gmail.com",
            user_metadata: { name: "Rishabh Verma" },
          },
        },
      }),
    },
  },
}));

describe("Sidebar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render navigation items (Overview, Agents, Leads, Live Support)", async () => {
    render(<Sidebar />);

    await waitFor(() => {
      expect(screen.getAllByText("Overview")[0]).toBeInTheDocument();
    });
    expect(screen.getAllByText("Agents")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Leads")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Live Support")[0]).toBeInTheDocument();
  });

  it("should render user profile section and toggle popover menu on click", async () => {
    render(<Sidebar />);

    await waitFor(() => {
      expect(screen.getAllByText("Rishabh Verma")[0]).toBeInTheDocument();
    });

    const userProfileTrigger = screen.getAllByText("Rishabh Verma")[0];
    fireEvent.click(userProfileTrigger);

    expect(screen.getAllByText("Upgrade plan")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Profile")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Settings")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Help")[0]).toBeInTheDocument();

    const logoutItem = screen.getAllByText("Log out")[0];
    fireEvent.click(logoutItem);

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });
});
