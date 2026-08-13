import { render, screen } from "@testing-library/react";
import { Breadcrumbs } from "./Breadcrumbs";

let mockPathname = "/admin/bots";
jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

jest.mock("@/context/BreadcrumbContext", () => ({
  useBreadcrumb: () => ({
    meta: {
      customLabels: {},
      nonLinkable: [],
    },
  }),
}));

describe("Breadcrumbs Component", () => {
  it("should return null if pathname has 1 or fewer segments", () => {
    mockPathname = "/admin";
    const { container } = render(<Breadcrumbs />);
    expect(container.firstChild).toBeNull();
  });

  it("should render breadcrumb items for multi-segment path", () => {
    mockPathname = "/admin/bots";
    render(<Breadcrumbs />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Bots")).toBeInTheDocument();
  });
});
