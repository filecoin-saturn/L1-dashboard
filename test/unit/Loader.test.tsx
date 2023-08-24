import { render, screen } from "@testing-library/react";
import { it, describe, expect } from "vitest";
import Loader from "../../src/components/Loader";

describe("Loader", () => {
  it("renders with default size when no size prop is provided", () => {
    render(<Loader />);
    const loader = screen.getByTestId("loader");

    expect(loader).toHaveStyle({ width: "16px", height: "16px" });
  });

  it("renders with provided size", () => {
    render(<Loader size={48} />);
    const loader = screen.getByTestId("loader");

    expect(loader).toHaveStyle({ width: "48px", height: "48px" });
  });

  it("applies provided className", () => {
    render(<Loader className="test-class" />);
    const loader = screen.getByTestId("loader");

    expect(loader).toHaveClass("test-class");
  });
});
