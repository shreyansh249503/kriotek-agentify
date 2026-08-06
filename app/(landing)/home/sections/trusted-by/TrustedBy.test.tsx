import { render, screen } from "@testing-library/react";
import { TrustedBy } from "./TrustedBy";
import React from "react";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt || ""} />
  ),
}));

describe("TrustedBy Component", () => {
  it("should render trusted title and brand logos", () => {
    render(<TrustedBy />);

    expect(
      screen.getByText("TRUSTED BY 1000+ BUSINESSES WORLDWIDE")
    ).toBeInTheDocument();
    const logos = screen.getAllByAltText("Trusted By");
    expect(logos).toHaveLength(5);
  });
});
