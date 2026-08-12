import { render, screen, fireEvent } from "@testing-library/react";
import { Adminheader } from "./Adminheader";
import React from "react";
import { usePathname } from "next/navigation";

const mockToggleSidebar = jest.fn();
const mockToggleDrawer = jest.fn();

jest.mock("@/context/SidebarContext", () => ({
  useSidebar: () => ({
    toggleSidebar: mockToggleSidebar,
    toggleDrawer: mockToggleDrawer,
  }),
}));

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("Adminheader Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue("/admin");
  });

  it("should render page title 'Dashboard', toggle buttons, and home button on /admin", () => {
    render(<Adminheader />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    const homeBtn = screen.getByRole("link", { name: /go to home/i });
    expect(homeBtn).toBeInTheDocument();
    expect(homeBtn).toHaveAttribute("href", "/");
  });

  it("should render 'New Ai Agent' button linking to /admin/new on /admin/bots", () => {
    (usePathname as jest.Mock).mockReturnValue("/admin/bots");
    render(<Adminheader />);

    const newAgentBtn = screen.getByRole("link", { name: /new ai agent/i });
    expect(newAgentBtn).toBeInTheDocument();
    expect(newAgentBtn).toHaveAttribute("href", "/admin/new");
  });

  it("should trigger toggleSidebar and toggleDrawer when buttons are clicked", () => {
    render(<Adminheader />);

    const sidebarBtn = screen.getByTitle("Toggle Sidebar");
    const drawerBtn = screen.getByTitle("Open Menu");

    fireEvent.click(sidebarBtn);
    expect(mockToggleSidebar).toHaveBeenCalledTimes(1);

    fireEvent.click(drawerBtn);
    expect(mockToggleDrawer).toHaveBeenCalledTimes(1);
  });
});
