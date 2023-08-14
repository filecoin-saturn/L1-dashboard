import bytes from "bytes";
import dayjs from "dayjs";
import type { DurationUnitType } from "dayjs/plugin/duration";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import * as api from "../../api";
import { GlobalMetrics, MetricsResponse, TimePeriod } from "../../api.types";
import { pastDateRange } from "../../date-utils";
import BandwidthChart from "./components/BandwidthChart";
import EarningsChart from "./components/EarningsChart";
import NodesTable from "./components/NodesTable";
import RequestsChart from "./components/RequestsChart";

interface OverviewProps {
  node?: string | null;
  globalMetrics: GlobalMetrics;
  address: string;
  children?: ReactNode;
}

const UPTIME_REQ_DOCS = "https://docs.saturn.tech/nodes-uptime-requirement";
export const PAYOUT_STATUS_MAPPING: Record<string, string> = {
  valid: "Eligible",
  pending: "In Progress",
  postponed: "Postponed",
};

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

function SelectTimePeriod(props: { period: TimePeriod; handleChangePeriod: (timePeriod: TimePeriod) => void }) {
  const options = Object.values(TimePeriod);

  return (
    <select
      value={props.period}
      onChange={(e) => props.handleChangePeriod(e.target.value as TimePeriod)}
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

const ProgressBar = (progressPercentage: number) => {
  return (
    <div className="min-w-10 flex-start relative flex h-4 w-full overflow-hidden bg-gray-300 font-sans text-xs font-medium text-[#0f172a]">
      <p className="absolute left-20 ">{`${progressPercentage.toFixed(1)}% Complete`} </p>

      <div
        className={`min-w-10 flex h-full items-baseline justify-center overflow-visible break-all text-black
        ${progressPercentage < 100 ? "bg-yellow-600" : "bg-green-600"}`}
        style={{ width: `${progressPercentage}%` }}
      ></div>
    </div>
  );
};

function Overview(props: OverviewProps) {
  let { totalEarnings, totalBandwidth, totalRetrievals, nodes, perNodeMetrics } = props.globalMetrics;

  let nodeStats;
  if (props.node) {
    nodeStats = perNodeMetrics.find((item) => item.nodeId === props.node);
    if (nodeStats) {
      totalEarnings = nodeStats.filAmount;
      totalBandwidth = nodeStats.numBytes;
      totalRetrievals = nodeStats.numRequests;
    }
  }
  // Might be worth using useMemo here if data sets become large.
  const numActiveNodes = nodes.find((d) => d.state === "active")?.count ?? 0;
  const numInactiveNodes = nodes.find((d) => d.state === "inactive")?.count ?? 0;
  const numDownNodes = nodes.find((d) => d.state === "down")?.count ?? 0;

  const nodeStatusesSection = (
    <>
      <div>Nodes</div>
      <div>
        {numActiveNodes.toLocaleString()} Active
        {numInactiveNodes > 0 && `, ${numInactiveNodes} Inactive`}
        {numDownNodes > 0 && `, ${numDownNodes} Down`}
      </div>
    </>
  );
  const nodeStateSection = nodeStats && (
    <>
      <div>State</div>
      <div>{nodeStats.state}</div>
    </>
  );

  const nodeIdSection = nodeStats && (
    <>
      <div>Node Id</div>
      <div>{props.node}</div>
    </>
  );

  const nodePayoutSection = nodeStats && (
    <>
      <div>
        <a href={UPTIME_REQ_DOCS} target="_blank" rel="noopener noreferrer">
          Payout Eligibility
        </a>
      </div>
      <div>{PAYOUT_STATUS_MAPPING[nodeStats.payoutStatus]}</div>
    </>
  );

  const uptimeCompletionSection = !(nodeStats?.uptimeCompletion === undefined) && (
    <>
      <div>
        <a href={UPTIME_REQ_DOCS} target="_blank" rel="noopener noreferrer">
          Uptime Requirement
        </a>
      </div>
      {ProgressBar(nodeStats.uptimeCompletion * 100)}
    </>
  );
  return (
    <div className="flex h-[350px] w-[100%] max-w-[600px] flex-col rounded">
      <div className="flex items-center justify-between bg-[#0066B4] py-2 px-4 text-lg">
        Overview
        {props.children}
      </div>
      <div className="grid flex-1 grid-cols-[auto_1fr] items-center gap-y-2 gap-x-8 bg-slate-900 p-4">
        <div>Address</div>
        <div className="truncate">{props.address}</div>
        {props.node && nodeIdSection}
        {props.node ? nodeStateSection : nodeStatusesSection}
        <div>Estimated Earnings</div>
        <div>{totalEarnings.toLocaleString()} FIL</div>
        {props.node && nodePayoutSection}
        {props.node && uptimeCompletionSection}
        <div>Bandwidth</div>
        <div>{bytes(totalBandwidth, { unitSeparator: " " })}</div>
        <div>Retrievals</div>
        <div>{totalRetrievals.toLocaleString()}</div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { address = "", nodeId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

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

  const period = useMemo(() => {
    const periodQS = searchParams.get("period");
    if (!periodQS) {
      searchParams.set("period", TimePeriod.WEEK);
      setSearchParams(searchParams);
    }

    return (periodQS as TimePeriod) ?? TimePeriod.WEEK;
  }, [searchParams]);

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

      let nodeMetricRes;
      if (nodeId) {
        nodeMetricRes = await api.fetchNodeMetrics(nodeId, startDate, endDate, chartProps.step, controller.signal);
      }
      const addressMetricRes = await api.fetchMetrics(address, startDate, endDate, chartProps.step, controller.signal);
      const { globalStats, nodes, perNodeMetrics } = addressMetricRes;
      setGlobalMetrics({ ...globalStats, nodes, perNodeMetrics });

      if (nodeId && nodeMetricRes) {
        const { earnings, metrics } = nodeMetricRes;
        setMetricsRes({ earnings, metrics });
      }
      if (!nodeId && addressMetricRes) {
        const { earnings, metrics } = addressMetricRes;
        setMetricsRes({ earnings, metrics });
      }

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
    const controller = new AbortController();
    fetchData(controller);

    return () => controller.abort();
  }, [nodeId, address, period]);

  const handleChangePeriod = (timePeriod: TimePeriod) => {
    searchParams.set("period", timePeriod);
    setSearchParams(searchParams);
  };

  const { perNodeMetrics } = globalMetrics;
  const { metrics, earnings } = metricsRes;

  return (
    <div className="flex-1">
      {error && <p className="text-center text-lg text-red-600">Error: {error}</p>}
      <div className="mt-8 flex h-[calc(100%_-_58px)] w-full flex-col gap-1 lg:flex-row">
        <div className="order-first mb-12 lg:mb-0 ">
          <NodesTable metrics={perNodeMetrics} isLoading={isLoading} />
        </div>
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4">
          <div className="flex flex-wrap justify-center gap-12">
            <Overview {...{ globalMetrics, address, perNodeMetrics }} node={nodeId}>
              <SelectTimePeriod period={period} handleChangePeriod={handleChangePeriod} />
            </Overview>
            <BandwidthChart metrics={metrics} node={nodeId} {...chartPropsFinal} />
            <EarningsChart earnings={earnings} node={nodeId} {...chartPropsFinal} />
            <RequestsChart metrics={metrics} node={nodeId} {...chartPropsFinal} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
