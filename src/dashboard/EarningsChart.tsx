import { Line } from "react-chartjs-2";

import { Earning } from "@/api.types";
import ChartContainer, { ChartProps } from "./ChartContainer";
import { ChartOptions } from "chart.js";

interface EarningsChartProps extends ChartProps {
  earnings: Earning[];
}

// Chart config must take into account that earnings are calculated once per day
export default function EarningsChart(props: EarningsChartProps) {
  const { earnings, xScale, isLoading } = props;
  const options: ChartOptions<"line"> = {
    plugins: {
      title: {
        display: true,
        text: "Earnings",
      },
      tooltip: {
        callbacks: {
          label: ({ raw }) => `${Number(raw).toLocaleString("en-US", { notation: "compact" })} FIL`,
        },
      },
    },
    scales: {
      x: xScale,
      y: {
        ticks: {
          callback: (val) => `${Number(val).toLocaleString("en-US", { notation: "compact" })} FIL`,
        },
      },
    },
  };

  const data = {
    labels: earnings.map((e) => e.timestamp),
    datasets: [
      {
        data: earnings.map((e) => e.filAmount),
        spanGaps: 1000 * 60 * 60 * 24, // 1 day
      },
    ],
  };

  return (
    <ChartContainer isLoading={isLoading}>
      <Line options={options} data={data} />
    </ChartContainer>
  );
}
