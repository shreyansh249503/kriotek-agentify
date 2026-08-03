import { render, screen, waitFor } from "@testing-library/react";
import AuthGuard, { RefreshAuthGuard } from "./AuthGuard";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import React from "react";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

describe("AuthGuard Components", () => {
  const mockReplace = jest.fn();
  const mockedUseRouter = useRouter as jest.Mock;
  const mockedGetSession = supabase.auth.getSession as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ replace: mockReplace });
  });

  describe("AuthGuard", () => {
    it("should redirect unauthenticated users to /login and not render children", async () => {
      mockedGetSession.mockResolvedValueOnce({ data: { session: null } });

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/login");
      });

      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("should render children when user is authenticated", async () => {
      mockedGetSession.mockResolvedValueOnce({
        data: { session: { access_token: "token-123" } },
      });

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByText("Protected Content")).toBeInTheDocument();
      });

      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe("RefreshAuthGuard", () => {
    it("should redirect authenticated users to /admin and not render children", async () => {
      mockedGetSession.mockResolvedValueOnce({
        data: { session: { access_token: "token-123" } },
      });

      render(
        <RefreshAuthGuard>
          <div>Public Login Page</div>
        </RefreshAuthGuard>
      );

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/admin");
      });

      expect(screen.queryByText("Public Login Page")).not.toBeInTheDocument();
    });

    it("should render public children when user is not authenticated", async () => {
      mockedGetSession.mockResolvedValueOnce({ data: { session: null } });

      render(
        <RefreshAuthGuard>
          <div>Public Login Page</div>
        </RefreshAuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByText("Public Login Page")).toBeInTheDocument();
      });

      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});
