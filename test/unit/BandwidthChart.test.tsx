import { render, screen } from "@testing-library/react";
import { it, describe, expect, vi } from "vitest";
import { Line } from "react-chartjs-2";
import BandwidthChart from "../../src/pages/dashboard/components/BandwidthChart";
import { ReactNode } from "react";

type BandwidthChartProps = {
  metrics: Array<{
    timeStamp: Date;
    numBytes: number;
    max: string;
    numRequests: number;
    filAmount: number;
  }>;
  node: string | null;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  xScale: {
    type: string;
    time: {
      unit: string;
    };
    min: number;
    max: number;
  };
  step: string;
  spanGaps: number;
  isLoading: boolean;
  children?: ReactNode;
};

vi.mock("react-chartjs-2", () => ({
  Line: vi.fn(() => null), // Mocking Line component to not render the actual canvas
}));

const mockProps = {
  metrics: [
    {
      timeStamp: new Date(),
      numBytes: 1957161991,
      max: "active",
      numRequests: 3157,
      filAmount: 57.9787451701,
    },
    {
      timeStamp: new Date(),
      numBytes: 1795571840,
      max: "active",
      numRequests: 3603,
      filAmount: 57.9787451702,
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
    min: 1691482260000,
    max: 1692087060000,
  },
  step: "hour",
  spanGaps: 3600000,
  isLoading: false,
};
describe("BandWidthChart", () => {
  const renderWithProps = (props: Partial<BandwidthChartProps> = {}) => {
    const mergedProps: BandwidthChartProps = {
      ...mockProps,
      ...props,
    };
    render(<BandwidthChart {...mergedProps} />);
  };

  it("renders without crashing", () => {
    renderWithProps();
  });
  it("displays the correct title for Global Bandwidth Served", () => {
    renderWithProps();
    expect(Line).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          plugins: expect.objectContaining({
            title: expect.objectContaining({
              text: "Global Bandwidth Served",
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
              text: "Bandwidth Served for NodeX",
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
