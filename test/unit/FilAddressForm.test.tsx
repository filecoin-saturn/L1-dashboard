import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import FilAddressForm from "../../src/components/FilAddressForm";
import { it, describe, expect } from "vitest";

const FIL_ADDRESS = "f16m5slrkc6zumruuhdzn557a5sdkbkiellron4qa";

describe("FilAddressForm", () => {
  // Wrap the component with MemoryRouter to mock routing
  const renderWithRouter = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);
  it("renders without crashing", () => {
    renderWithRouter(<FilAddressForm />);
    const inputElement = screen.getByPlaceholderText("Enter FIL address");
    expect(inputElement).toBeInTheDocument();
  });

  it("displays an error when an invalid FIL address is provided", async () => {
    renderWithRouter(<FilAddressForm />);
    const inputElement = screen.getByPlaceholderText("Enter FIL address");

    // Simulate entering an invalid address using fireEvent
    fireEvent.change(inputElement, { target: { value: "invalid-address" } });

    const buttonElement = screen.getByRole("button");
    fireEvent.click(buttonElement);

    const errorMessage = await screen.findByText("Invalid FIL address");
    expect(errorMessage).toBeInTheDocument();
  });

  it("does not display error for a valid FIL address", () => {
    renderWithRouter(<FilAddressForm />);
    const inputElement = screen.getByPlaceholderText("Enter FIL address");

    // Simulate entering a valid address using fireEvent
    fireEvent.change(inputElement, { target: { value: FIL_ADDRESS } });

    const buttonElement = screen.getByRole("button");
    fireEvent.click(buttonElement);

    const errorMessage = screen.queryByText("Invalid FIL address");
    expect(errorMessage).not.toBeInTheDocument();
  });
});
