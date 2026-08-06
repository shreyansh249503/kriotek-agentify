import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Header } from "./Header";
import { supabase } from "@/lib/supabase";
import React from "react";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt || ""} />
  ),
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
      }),
    },
  },
}));

describe("Header Component", () => {
  const mockedGetSession = supabase.auth.getSession as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render sign in / try for free buttons when user is not authenticated", async () => {
    mockedGetSession.mockResolvedValueOnce({
      data: { session: null },
    });

    render(<Header />);

    await waitFor(() => {
      expect(screen.getByText("Sign in")).toBeInTheDocument();
      expect(screen.getByText("Try for Free")).toBeInTheDocument();
    });
  });

  it("should render Dashboard button when user is authenticated", async () => {
    mockedGetSession.mockResolvedValueOnce({
      data: { session: { user: { id: "user-123", email: "user@example.com" } } },
    });

    render(<Header />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Dashboard"));
    expect(mockPush).toHaveBeenCalledWith("/admin");
  });
});
