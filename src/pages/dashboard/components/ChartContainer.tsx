import { ReactNode } from "react";
import Loader from "../../../components/Loader";
import classNames from "classnames";

export interface ChartProps {
  isLoading: boolean;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  xScale: object;
  spanGaps: number;
  node?: string | null;
}

export interface ChartContainerProps {
  isLoading: boolean;
  children: ReactNode;
  fullHeight?: boolean;
}

export default function ChartContainer(props: ChartContainerProps) {
  return (
    <div
      className={classNames("relative w-[100%] max-w-[600px] rounded bg-slate-900 p-4 pt-2", {
        "h-[350px]": !props.fullHeight,
        "h-full": props.fullHeight,
      })}
    >
      {props.isLoading && <Loader className="absolute right-2 top-2" />}
      {props.children}
    </div>
  );
}
