import { render, screen, act } from "@testing-library/react";
import { BreadcrumbProvider, useBreadcrumb } from "./BreadcrumbContext";

const TestComponent = () => {
  const { meta, setBreadcrumbMeta } = useBreadcrumb();

  return (
    <div>
      <span data-testid="custom-label">{meta.customLabels["bot-id"] ?? "none"}</span>
      <span data-testid="non-linkable">{meta.nonLinkable.join(",")}</span>
      <button
        onClick={() =>
          setBreadcrumbMeta({
            customLabels: { "bot-id": "My Custom Bot" },
            nonLinkable: ["admin", "settings"],
          })
        }
      >
        Update Meta
      </button>
    </div>
  );
};

describe("BreadcrumbContext", () => {
  it("should initialize default meta values and allow updating breadcrumb metadata", () => {
    render(
      <BreadcrumbProvider>
        <TestComponent />
      </BreadcrumbProvider>
    );

    expect(screen.getByTestId("custom-label")).toHaveTextContent("none");
    expect(screen.getByTestId("non-linkable")).toHaveTextContent("");

    act(() => {
      screen.getByText("Update Meta").click();
    });

    expect(screen.getByTestId("custom-label")).toHaveTextContent("My Custom Bot");
    expect(screen.getByTestId("non-linkable")).toHaveTextContent("admin,settings");
  });

  it("should provide default dummy setBreadcrumbMeta function when used outside provider", () => {
    const TestDefaultComponent = () => {
      const { setBreadcrumbMeta } = useBreadcrumb();
      return (
        <button onClick={() => setBreadcrumbMeta({ customLabels: { test: "val" } })}>
          Call Default Function
        </button>
      );
    };

    render(<TestDefaultComponent />);
    expect(screen.getByText("Call Default Function")).toBeInTheDocument();
    screen.getByText("Call Default Function").click();
  });
});
