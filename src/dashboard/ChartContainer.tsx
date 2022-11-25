import Loader from "@/components/Loader";
import { ReactNode } from "react";

export interface ChartProps {
  isLoading: boolean;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  xScale: object;
  spanGaps: number;
}

export interface ChartContainerProps {
  isLoading: boolean;
  children: ReactNode;
}

export default function ChartContainer(props: ChartContainerProps) {
  return (
    <div
      className={`relative h-[300px] w-[100%] max-w-[600px] rounded bg-slate-900
            p-4 pt-2`}
    >
      {props.isLoading && <Loader className="absolute right-2 top-2" />}
      {props.children}
    </div>
  );
}
