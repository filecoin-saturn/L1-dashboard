import { Line } from "react-chartjs-2";

import { Metric } from "@/api.types";
import ChartContainer, { ChartProps } from "./ChartContainer";
import { ChartOptions } from "chart.js";

interface RequestsChartProps extends ChartProps {
  metrics: Metric[];
}

export default function RequestsChart(props: RequestsChartProps) {
  const { metrics, xScale, isLoading, spanGaps } = props;
  const options: ChartOptions<"line"> = {
    plugins: {
      title: {
        display: true,
        text: "Number of Retrievals",
      },
    },
    scales: {
      x: xScale,
    },
  };

  const data = {
    labels: metrics.map((m) => m.startTime),
    datasets: [
      {
        data: metrics.map((m) => m.numRequests),
        spanGaps,
      },
    ],
  };

  return (
    <ChartContainer isLoading={isLoading}>
      <Line options={options} data={data} />
    </ChartContainer>
  );
}
