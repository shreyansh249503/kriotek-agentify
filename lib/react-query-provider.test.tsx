import { render, screen } from "@testing-library/react";
import ReactQueryProvider from "./react-query-provider";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";

const TestComponent = () => {
  const queryClient = useQueryClient();
  return (
    <div>
      <span>Provider Active</span>
      <span data-testid="has-client">{queryClient ? "yes" : "no"}</span>
    </div>
  );
};

describe("ReactQueryProvider", () => {
  it("renders children wrapped in QueryClientProvider", () => {
    render(
      <ReactQueryProvider>
        <TestComponent />
      </ReactQueryProvider>
    );

    expect(screen.getByText("Provider Active")).toBeInTheDocument();
    expect(screen.getByTestId("has-client")).toHaveTextContent("yes");
  });
});
