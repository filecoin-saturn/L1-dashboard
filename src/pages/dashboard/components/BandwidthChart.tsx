import bytes from "bytes";
import { ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";
import { Metric } from "../../../api.types";
import ChartContainer, { ChartProps } from "./ChartContainer";

interface BandwidthChartProps extends ChartProps {
  metrics: Metric[];
}

export default function BandwidthChart(props: BandwidthChartProps) {
  const { xScale, metrics, isLoading, node, spanGaps } = props;

  let title = "Global Bandwidth Served";
  if (node) {
    title = `Bandwidth Served for ${node}`;
  }
  const options: ChartOptions<"line"> = {
    plugins: {
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: ({ raw }) => bytes(Number(raw), { unitSeparator: " " }),
        },
      },
    },
    scales: {
      x: xScale,
      y: {
        ticks: {
          callback: (val) => bytes(Number(val), { unitSeparator: " " }),
        },
      },
    },
  };

  const data = {
    labels: metrics.map((m) => m.timeStamp),
    datasets: [
      {
        data: metrics.map((m) => m.numBytes),
        spanGaps,
      },
    ],
  };

  return (
    <ChartContainer isLoading={isLoading}>
      <Line data-testid="bandwidthChart" options={options} data={data} />
    </ChartContainer>
  );
}
