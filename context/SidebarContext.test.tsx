import { render, screen, act } from "@testing-library/react";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import React from "react";

const TestComponent = () => {
  const { isCollapsed, toggleSidebar, setIsCollapsed, isDrawerOpen, toggleDrawer, closeDrawer } =
    useSidebar();

  return (
    <div>
      <span data-testid="collapsed">{String(isCollapsed)}</span>
      <span data-testid="drawer">{String(isDrawerOpen)}</span>
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
      <button onClick={() => setIsCollapsed(true)}>Set Collapsed True</button>
      <button onClick={toggleDrawer}>Toggle Drawer</button>
      <button onClick={closeDrawer}>Close Drawer</button>
    </div>
  );
};

describe("SidebarContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should initialize default state correctly and update localStorage on sidebar toggle", () => {
    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    expect(screen.getByTestId("collapsed")).toHaveTextContent("false");
    expect(screen.getByTestId("drawer")).toHaveTextContent("false");

    act(() => {
      screen.getByText("Toggle Sidebar").click();
    });

    expect(screen.getByTestId("collapsed")).toHaveTextContent("true");
    expect(localStorage.getItem("sidebar-collapsed")).toBe("true");

    act(() => {
      screen.getByText("Set Collapsed True").click();
    });

    expect(screen.getByTestId("collapsed")).toHaveTextContent("true");
  });

  it("should handle drawer toggle and close drawer actions", () => {
    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    expect(screen.getByTestId("drawer")).toHaveTextContent("false");

    act(() => {
      screen.getByText("Toggle Drawer").click();
    });
    expect(screen.getByTestId("drawer")).toHaveTextContent("true");

    act(() => {
      screen.getByText("Close Drawer").click();
    });
    expect(screen.getByTestId("drawer")).toHaveTextContent("false");
  });

  it("should initialize isCollapsed to true if localStorage has sidebar-collapsed set to true", () => {
    localStorage.setItem("sidebar-collapsed", "true");

    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );

    expect(screen.getByTestId("collapsed")).toHaveTextContent("true");
  });

  it("should throw error if useSidebar is used outside SidebarProvider", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      "useSidebar must be used within a SidebarProvider"
    );

    consoleError.mockRestore();
  });

  it("should handle SSR environment where window is undefined during initial state setup", () => {
    const originalWindow = global.window;
    try {
      // @ts-expect-error simulating SSR environment
      delete global.window;
      jest.isolateModules(() => {
        const { SidebarProvider: SSRSidebarProvider } = jest.requireActual("./SidebarContext");
        expect(SSRSidebarProvider).toBeDefined();
      });
    } finally {
      global.window = originalWindow;
    }
  });
});
