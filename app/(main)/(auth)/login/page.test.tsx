import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "./page";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import React from "react";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/components/AuthGuard", () => ({
  RefreshAuthGuard: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      signInWithPassword: jest.fn(),
    },
  },
}));

describe("LoginPage", () => {
  const mockReplace = jest.fn();
  const mockedSignIn = supabase.auth.signInWithPassword as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
  });

  it("renders login form correctly", () => {
    render(<LoginPage />);

    expect(screen.getByRole("heading", { name: "Welcome Back" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("toggles password visibility when button is clicked", () => {
    render(<LoginPage />);
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    const toggleButton = passwordInput.nextElementSibling as HTMLButtonElement;
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("text");

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("password");
  });

  it("handles successful login and redirects to /admin", async () => {
    mockedSignIn.mockResolvedValueOnce({ data: { user: {} }, error: null });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(mockedSignIn).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockReplace).toHaveBeenCalledWith("/admin");
    });
  });

  it("displays error message on failed login", async () => {
    mockedSignIn.mockResolvedValueOnce({
      data: {},
      error: { message: "Invalid login credentials" },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid login credentials")).toBeInTheDocument();
    });
  });
});
