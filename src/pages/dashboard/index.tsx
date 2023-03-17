import bytes from "bytes";
import dayjs from "dayjs";
import type { DurationUnitType } from "dayjs/plugin/duration";
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import * as api from "../../api";
import { GlobalMetrics, MetricsResponse, TimePeriod } from "../../api.types";
import { pastDateRange } from "../../date-utils";
import BandwidthChart from "./components/BandwidthChart";
import EarningsChart from "./components/EarningsChart";
import NodesTable from "./components/NodesTable";
import RequestsChart from "./components/RequestsChart";

interface OverviewProps {
  globalMetrics: GlobalMetrics;
  address: string;
  children?: ReactNode;
}

function createChartProps(period: TimePeriod) {
  let dateRange;
  let step: DurationUnitType; // group by this time unit
  let labelUnit: DurationUnitType;

  switch (period) {
    case TimePeriod.ONE_YEAR:
      dateRange = pastDateRange("day", 365);
      step = "day";
      labelUnit = "day";
      break;
    case TimePeriod.THREE_MONTHS:
      dateRange = pastDateRange("day", 90);
      step = "day";
      labelUnit = "day";
      break;
    case TimePeriod.MONTH:
      dateRange = pastDateRange("day", 30);
      step = "day";
      labelUnit = "day";
      break;
    case TimePeriod.TWO_WEEK:
      dateRange = pastDateRange("week", 2);
      step = "hour";
      labelUnit = "day";
      break;
    case TimePeriod.WEEK:
      dateRange = pastDateRange("week");
      step = "hour";
      labelUnit = "day";
      break;
    case TimePeriod.DAY:
    default:
      dateRange = pastDateRange("day");
      step = "hour";
      labelUnit = step;
      break;
  }

  const xScale = {
    type: "time",
    time: {
      unit: labelUnit,
    },
    min: dateRange.startDate.getTime(),
    max: dateRange.endDate.getTime(),
  };

  // https://github.com/chartjs/Chart.js/pull/6993
  // Break the line chart when missing a data point.
  const spanGaps = dayjs.duration(1, step).asMilliseconds();

  return { dateRange, xScale, step, spanGaps, isLoading: false };
}

function SelectTimePeriod(props: { period: TimePeriod; setPeriod: Dispatch<SetStateAction<TimePeriod>> }) {
  const options = Object.values(TimePeriod);

  return (
    <select
      value={props.period}
      onChange={(e) => props.setPeriod(e.target.value as TimePeriod)}
      className="rounded bg-slate-900 p-1"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function Overview(props: OverviewProps) {
  // const { earnings, nodes, metrics } = props.metricsRes;
  const { totalEarnings, totalBandwidth, totalRetrievals, nodes } = props.globalMetrics;

  // Might be worth using useMemo here if data sets become large.
  const numActiveNodes = nodes.find((d) => d.state === "active")?.count ?? 0;
  const numInactiveNodes = nodes.find((d) => d.state === "inactive")?.count ?? 0;
  const numDownNodes = nodes.find((d) => d.state === "down")?.count ?? 0;

  return (
    <div className="flex h-[350px] w-[100%] max-w-[600px] flex-col rounded">
      <div className="flex items-center justify-between bg-[#0066B4] py-2 px-4 text-lg">
        Overview
        {props.children}
      </div>
      <div className="grid flex-1 grid-cols-[auto_1fr] items-center gap-y-2 gap-x-8 bg-slate-900 p-4">
        <div>Address</div>
        <div className="truncate">{props.address}</div>
        <div>Nodes</div>
        <div>
          {numActiveNodes.toLocaleString()} Active
          {numInactiveNodes > 0 && `, ${numInactiveNodes} Inactive`}
          {numDownNodes > 0 && `, ${numDownNodes} Down`}
        </div>
        <div>Estimated Earnings</div>
        <div>{totalEarnings.toLocaleString()} FIL</div>
        <div>Bandwidth</div>
        <div>{bytes(totalBandwidth, { unitSeparator: " " })}</div>
        <div>Retrievals</div>
        <div>{totalRetrievals.toLocaleString()}</div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { address = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const [selectedNode, setSelectedNode] = useState<null | string>(null);

  const defaultPeriod = (searchParams.get("period") as TimePeriod) ?? TimePeriod.WEEK;
  const [period, setPeriod] = useState<TimePeriod>(defaultPeriod);
  const [globalMetrics, setGlobalMetrics] = useState<GlobalMetrics>({
    totalEarnings: 0,
    totalRetrievals: 0,
    totalBandwidth: 0,
    perNodeMetrics: [],
    nodes: [],
  });
  const [metricsRes, setMetricsRes] = useState<MetricsResponse>({
    earnings: [],
    metrics: [],
  });

  const chartProps = createChartProps(period);

  // Don't update chart axes until data is fetched.
  // It looks weird if axes update before data does.
  const [chartPropsFinal, setChartPropsFinal] = useState(chartProps);
  chartPropsFinal.isLoading = isLoading;

  const fetchData = async (controller: AbortController) => {
    setIsLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = chartProps.dateRange;

      let metricsRes;
      if (selectedNode) {
        metricsRes = await api.fetchNodeMetrics(selectedNode, startDate, endDate, chartProps.step, controller.signal);
      } else {
        metricsRes = await api.fetchMetrics(address, startDate, endDate, chartProps.step, controller.signal);
        const { globalStats, nodes, perNodeMetrics } = metricsRes;
        setGlobalMetrics({ ...globalStats, nodes, perNodeMetrics });
      }

      const { earnings, metrics } = metricsRes;
      setMetricsRes({ earnings, metrics });

      setChartPropsFinal(chartProps);
    } catch (err) {
      if (err instanceof Error && !controller.signal.aborted) {
        setError(err?.message ?? "Error retrieving metrics.");
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!address) {
      return;
    }

    searchParams.set("period", period);
    setSearchParams(searchParams);
    const controller = new AbortController();
    fetchData(controller);

    return () => controller.abort();
  }, [address, period, selectedNode]);

  const { perNodeMetrics } = globalMetrics;
  const { metrics, earnings } = metricsRes;

  return (
    <div className="mx-auto mt-8 flex max-w-7xl flex-1 flex-col gap-4">
      {error && <p className="text-center text-lg text-red-600">Error: {error}</p>}
      <div className="flex flex-wrap justify-center gap-12">
        <Overview {...{ globalMetrics, address }}>
          <SelectTimePeriod period={period} setPeriod={setPeriod} />
        </Overview>
        <NodesTable metrics={perNodeMetrics} setSelectedNode={setSelectedNode} />
        <EarningsChart earnings={earnings} node={selectedNode} {...chartPropsFinal} />
        <RequestsChart metrics={metrics} node={selectedNode} {...chartPropsFinal} />
        <BandwidthChart metrics={metrics} node={selectedNode} {...chartPropsFinal} />
      </div>
    </div>
  );
}

export default Dashboard;
