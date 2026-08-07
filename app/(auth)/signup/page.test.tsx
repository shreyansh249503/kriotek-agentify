import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignupPage from "./page";
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
      signUp: jest.fn(),
    },
  },
}));

describe("SignupPage", () => {
  const mockPush = jest.fn();
  const mockedSignUp = supabase.auth.signUp as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders signup form correctly", () => {
    render(<SignupPage />);

    expect(screen.getByRole("heading", { name: "Create Account" })).toBeInTheDocument();
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
  });

  it("toggles password visibility when button is clicked", () => {
    render(<SignupPage />);
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    const toggleButton = passwordInput.nextElementSibling as HTMLButtonElement;
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("text");

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("password");
  });

  it("handles successful signup and redirects to /login after delay", async () => {
    mockedSignUp.mockResolvedValueOnce({ data: { user: {} }, error: null });

    render(<SignupPage />);

    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "securepassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(mockedSignUp).toHaveBeenCalledWith({
        email: "john@example.com",
        password: "securepassword",
        options: {
          data: {
            name: "John Doe",
          },
        },
      });
      expect(screen.getByText("Account created! Redirecting to login...")).toBeInTheDocument();
    });

    jest.advanceTimersByTime(2000);
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("displays error message on failed signup", async () => {
    mockedSignUp.mockResolvedValueOnce({
      data: {},
      error: { message: "User already registered" },
    });

    render(<SignupPage />);

    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "existing@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "securepassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(screen.getByText("User already registered")).toBeInTheDocument();
    });
  });
});
