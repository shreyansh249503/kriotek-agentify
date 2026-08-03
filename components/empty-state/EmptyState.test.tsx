import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "./EmptyState";
import React from "react";

describe("EmptyState Component", () => {
  it("should render title, description, and icon", () => {
    render(
      <EmptyState
        icon={<span data-testid="empty-icon">Icon</span>}
        title="No Bots Found"
        description="You have not created any bots yet."
      />
    );

    expect(screen.getByTestId("empty-icon")).toBeInTheDocument();
    expect(screen.getByText("No Bots Found")).toBeInTheDocument();
    expect(screen.getByText("You have not created any bots yet.")).toBeInTheDocument();
  });

  it("should render action button and handle click events when actionLabel and onAction are provided", () => {
    const handleAction = jest.fn();
    render(
      <EmptyState
        icon={<span>Icon</span>}
        title="No Data"
        description="Create your first item."
        actionLabel="Create Item"
        onAction={handleAction}
      />
    );

    const button = screen.getByRole("button", { name: "Create Item" });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
