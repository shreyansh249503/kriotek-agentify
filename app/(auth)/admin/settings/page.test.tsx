import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SettingsPage from "./page";
import { useCurrentUser } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

jest.mock("@/hooks/useAuth");
jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      updateUser: jest.fn(),
    },
  },
}));

describe("SettingsPage Component", () => {
  const mockUseCurrentUser = useCurrentUser as jest.Mock;

  const mockUser = {
    id: "user-1",
    email: "user@example.com",
    user_metadata: {
      name: "Jane User",
      phone: "+1999888777",
      company: "Acme Corp",
      role: "admin",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render loading state when user query is loading", () => {
    mockUseCurrentUser.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { container } = render(<SettingsPage />);
    expect(container).toBeInTheDocument();
  });

  it("should render user profile details when loaded", () => {
    mockUseCurrentUser.mockReturnValue({
      data: mockUser,
      isLoading: false,
    });

    render(<SettingsPage />);

    expect(screen.getByText("Jane User")).toBeInTheDocument();
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
  });

  it("should handle profile form input changes and save updates successfully", async () => {
    mockUseCurrentUser.mockReturnValue({
      data: mockUser,
      isLoading: false,
    });

    (supabase.auth.updateUser as jest.Mock).mockResolvedValue({ error: null });

    render(<SettingsPage />);

    const saveButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: {
          name: "Jane User",
          phone: "+1999888777",
          company: "Acme Corp",
        },
      });
      expect(
        screen.getByText("Profile updated successfully!")
      ).toBeInTheDocument();
    });
  });

  it("should display error message when passwords do not match", async () => {
    mockUseCurrentUser.mockReturnValue({
      data: mockUser,
      isLoading: false,
    });

    render(<SettingsPage />);

    const newPasswordInput = screen.getByPlaceholderText("Enter new password");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm new password");
    fireEvent.change(newPasswordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "mismatch" } });

    const saveButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
  });
});
