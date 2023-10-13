import { render, screen } from "@testing-library/react";
import ChartContainer from "../../src/pages/dashboard/components/ChartContainer";
import { it, describe, expect } from "vitest";

describe("ChartContainer", () => {
  it("renders children", () => {
    render(<ChartContainer isLoading={false}>Test Children</ChartContainer>);
    expect(screen.getByText("Test Children")).toBeInTheDocument();
  });

  it("displays loader when isLoading is true", () => {
    render(<ChartContainer isLoading={true}>Test Children</ChartContainer>);

    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("does not display loader when isLoading is false", () => {
    render(<ChartContainer isLoading={false}>Test Children</ChartContainer>);

    expect(screen.queryByTestId("loader")).toBeNull();
  });
});
