import { render, screen } from "@testing-library/react";
import { it, describe, expect } from "vitest";
import Spinner from "../../src/components/Spinner";

describe("Spinner", () => {
  it("renders with correct attributes", () => {
    render(<Spinner />);

    const circle = screen.getByTestId("spinner-circle");
    const path = screen.getByTestId("spinner-path");

    expect(circle).toBeInTheDocument();
    expect(path).toBeInTheDocument();

    expect(circle).toHaveAttribute("cx", "12");
    expect(circle).toHaveAttribute("cy", "12");
    expect(circle).toHaveAttribute("r", "10");
    expect(path).toHaveAttribute("fill", "currentColor");
  });
});
