import { render, screen } from "@testing-library/react";
import { it, describe, expect, vi } from "vitest";
import { Line } from "react-chartjs-2";
import EarningsChart from "../../src/pages/dashboard/components/EarningsChart";

vi.mock("react-chartjs-2", () => ({
  Line: vi.fn(() => null), // Mocking Line component to not render the actual canvas
}));

const mockProps = {
  earnings: [
    {
      filAmount: 57.9787451701,
      timestamp: new Date(),
    },
    {
      filAmount: 57.9787451702,
      timestamp: new Date(),
    },
  ],
  node: null,
  dateRange: {
    startDate: new Date(),
    endDate: new Date(),
  },
  xScale: {
    type: "time",
    time: {
      unit: "day",
    },
    min: 1691483220000,
    max: 1692088020000,
  },
  step: "hour",
  spanGaps: 3600000,
  isLoading: false,
};
describe("EarningChart", () => {
  const renderWithProps = (prop = {}) => {
    const props = { ...mockProps, ...prop };
    render(<EarningsChart {...props} />);
  };

  it("renders without crashing", () => {
    renderWithProps();
  });
  it("displays the correct title for global earnings", () => {
    renderWithProps();
    expect(Line).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          plugins: expect.objectContaining({
            title: expect.objectContaining({
              text: "Global Earnings",
            }),
          }),
        }),
      }),
      {}
    );
  });

  it("displays the correct title for a specific node", () => {
    renderWithProps({ node: "NodeX" });
    expect(Line).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          plugins: expect.objectContaining({
            title: expect.objectContaining({
              text: "Earnings for NodeX",
            }),
          }),
        }),
      }),
      {}
    );
  });

  it("passes isLoading prop correctly to ChartContainer", () => {
    renderWithProps({ isLoading: true });
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });
});
