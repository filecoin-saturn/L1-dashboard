import { render, fireEvent, waitFor } from "@testing-library/react";
import GridButton from "../../src/components/StatsGrid/GridButton";
import { it, describe, expect, vi } from "vitest";

describe("GridButton Component", () => {
  const mockOnClick = vi.fn();
  const renderButton = () => {
    return render(<GridButton onClick={mockOnClick}>Click Me</GridButton>);
  };
  it("renders without crashing", () => {
    const { getByText } = renderButton();
    expect(getByText("Click Me")).toBeInTheDocument();
  });

  it("calls onClick when button is clicked", () => {
    const { getByText } = renderButton();
    fireEvent.click(getByText("Click Me"));
    expect(mockOnClick).toHaveBeenCalled();
  });

  it("changes the button class when clicked and reverts after 500ms", async () => {
    const { getByText } = renderButton();
    const button = getByText("Click Me");

    fireEvent.click(button);
    expect(button).toHaveClass("bg-primary");
    expect(button).not.toHaveClass("bg-slate-700");

    await waitFor(() => {
      expect(button).not.toHaveClass("bg-primary");
      expect(button).toHaveClass("bg-slate-700");
    });
  });

  it("cleans up the timer after unmounting", async () => {
    const { unmount, getByText } = renderButton();
    const button = getByText("Click Me");

    fireEvent.click(button);
    expect(button).toHaveClass("bg-primary");

    unmount();
  });
});
