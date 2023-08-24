import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NavBar from "../../src/components/NavBar";
import { it, describe, expect } from "vitest";

describe("NavBar", () => {
  // Wrap the component with MemoryRouter to mock routing
  const renderWithRouter = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

  it("renders NavBar component", () => {
    renderWithRouter(<NavBar />);
    const navbarElement = screen.getByTestId("navbar");
    expect(navbarElement).toBeInTheDocument();
  });

  it("navigation links render correctly", () => {
    renderWithRouter(<NavBar />);

    // Desktop view navigation
    const navItems = screen.getAllByRole("link");
    expect(navItems).toHaveLength(2);
    expect(navItems[0]).toHaveTextContent("Dashboard");
    expect(navItems[1]).toHaveTextContent("Address overview");
  });
});
