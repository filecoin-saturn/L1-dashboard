import { ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";
import { Metric } from "../../../api.types";
import ChartContainer, { ChartProps } from "./ChartContainer";

interface RequestsChartProps extends ChartProps {
  metrics: Metric[];
}

export default function RequestsChart(props: RequestsChartProps) {
  const { metrics, xScale, node, isLoading, spanGaps } = props;

  let title = "Global Retrievals";
  if (node) {
    title = `Retrievals for ${node}`;
  }
  const options: ChartOptions<"line"> = {
    plugins: {
      title: {
        display: true,
        text: title,
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
