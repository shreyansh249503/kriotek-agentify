import { render, screen } from "@testing-library/react";
import AdminPage from "./page";
import React from "react";

jest.mock("./AdminContent", () => {
  return function MockAdminContent() {
    return <div data-testid="admin-content">Admin Content</div>;
  };
});

describe("AdminPage Component", () => {
  it("should render AdminContent component", () => {
    render(<AdminPage />);
    expect(screen.getByTestId("admin-content")).toBeInTheDocument();
  });
});
