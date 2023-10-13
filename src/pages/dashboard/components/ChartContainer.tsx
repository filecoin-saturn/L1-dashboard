import { ReactNode } from "react";
import Loader from "../../../components/Loader";

export interface ChartProps {
  isLoading: boolean;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  xScale: object;
  spanGaps: number;
  node: string | null;
}

export interface ChartContainerProps {
  isLoading: boolean;
  children: ReactNode;
}

export default function ChartContainer(props: ChartContainerProps) {
  return (
    <div
      data-testid="chart-container"
      className={`relative h-[350px] w-[100%] max-w-[600px] rounded bg-slate-900
            p-4 pt-2`}
    >
      {props.children}
      {props.isLoading && <Loader className="absolute top-0 bottom-0 left-0 right-0 m-auto" size={48} />}
    </div>
  );
}
