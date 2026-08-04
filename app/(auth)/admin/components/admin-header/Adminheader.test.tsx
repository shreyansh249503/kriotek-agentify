import { render, screen, fireEvent } from "@testing-library/react";
import { Adminheader } from "./Adminheader";
import React from "react";

const mockToggleSidebar = jest.fn();
const mockToggleDrawer = jest.fn();

jest.mock("@/context/SidebarContext", () => ({
  useSidebar: () => ({
    toggleSidebar: mockToggleSidebar,
    toggleDrawer: mockToggleDrawer,
  }),
}));

jest.mock("next/navigation", () => ({
  usePathname: () => "/admin",
}));

describe("Adminheader Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render page title 'Dashboard', toggle buttons, and home button", () => {
    render(<Adminheader />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Go to Home")).toBeInTheDocument();
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
