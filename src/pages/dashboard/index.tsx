import bytes from "bytes";
import dayjs from "dayjs";
import type { DurationUnitType } from "dayjs/plugin/duration";
import { Dispatch, ReactNode, SetStateAction, useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import * as api from "../../api";
import {
  DateRange,
  EarningsPeriod,
  FilterType,
  GlobalMetrics,
  MetricsResponse,
  PastNUnitsPeriod,
  TimePeriod,
} from "../../api.types";
import { getEaringsPeriodOptions, parseDateRange, pastDateRange } from "../../date-utils";
import BandwidthChart from "./components/BandwidthChart";
import EarningsChart from "./components/EarningsChart";
import NodesTable from "./components/NodesTable";
import RequestsChart from "./components/RequestsChart";
import Loader from "../../components/Loader";

interface OverviewProps {
  node: string | null;
  globalMetrics: GlobalMetrics;
  address: string;
  children?: ReactNode;
  isLoading: boolean;
}
interface PeriodRangeOptions {
  pastNUnitsPeriod?: string;
  earningPeriod?: EarningsPeriod;
  dateRange?: { startDate: Date; endDate: Date };
}

const inputClass = `rounded p-2 bg-slate-900 text-slate-100 text-center`;

const UPTIME_REQ_DOCS = "https://docs.saturn.tech/nodes-uptime-requirement";
export const PAYOUT_STATUS_MAPPING: Record<string, string> = {
  valid: "Eligible",
  pending: "In Progress",
  postponed: "Postponed",
};
const earningOptions: EarningsPeriod[] = getEaringsPeriodOptions(new Date("November 1, 2022"));

function createChartProps(periodType: string, periodRange: PeriodRangeOptions) {
  let dateRange: DateRange;
  let step: DurationUnitType; // group by this time unit
  let labelUnit: DurationUnitType;

  switch (periodType) {
    case FilterType.PastNUnits:
      switch (periodRange.pastNUnitsPeriod) {
        case PastNUnitsPeriod.DAY:
          dateRange = pastDateRange("day");
          step = "hour";
          labelUnit = step;
          break;
        case PastNUnitsPeriod.MONTH:
          dateRange = pastDateRange("day", 30);
          step = "day";
          labelUnit = "day";
          break;
        case PastNUnitsPeriod.THREE_MONTHS:
          dateRange = pastDateRange("day", 90);
          step = "day";
          labelUnit = "day";
          break;
        case PastNUnitsPeriod.ONE_YEAR:
          dateRange = pastDateRange("day", 365);
          step = "day";
          labelUnit = "day";
          break;
        default:
          dateRange = pastDateRange("week");
          step = "day";
          labelUnit = "day";
          break;
      }
      break;
    case FilterType.Earnings: {
      if (periodRange.earningPeriod?.date === undefined) {
        throw new Error("Undefined earning period date");
      }
      dateRange = {
        startDate: dayjs(periodRange.earningPeriod.date).toDate(),
        endDate: dayjs(periodRange.earningPeriod.date).add(1, "month").toDate(),
      };
      step = "day";
      labelUnit = "day";
      break;
    }
    case FilterType.DateRange: {
      if (periodRange.dateRange === undefined || periodRange.dateRange.startDate > periodRange.dateRange.endDate) {
        throw new Error("Invalid date range");
      }
      dateRange = periodRange.dateRange;
      step = "day";
      labelUnit = "day";
      break;
    }
    default:
      throw Error("Unsupported periodType");
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

function SelectTimePeriod(props: { filter: FilterType; setFilter: Dispatch<SetStateAction<FilterType>> }) {
  return (
    <select value={props.filter} onChange={(e) => props.setFilter(e.target.value as FilterType)} className={inputClass}>
      {Object.entries(TimePeriod).map(([k, v]) => (
        <option key={k} value={k}>
          {v}
        </option>
      ))}
    </select>
  );
}

function SelectPastNPeriod(props: { period: string; onChange: (nextPeriod: string) => void }) {
  useEffect(() => {
    if (!Object.values(PastNUnitsPeriod).includes(props.period as PastNUnitsPeriod)) {
      props.onChange(PastNUnitsPeriod.WEEK);
    }
    // Correct period query string on mounted
  }, []);

  return (
    <select value={props.period} onChange={(e) => props.onChange(e.target.value)} className={inputClass}>
      {Object.values(PastNUnitsPeriod).map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function SelectMonthPeriod(props: { period: string; onChange: (nextPeriod: string) => void }) {
  useEffect(() => {
    if (!earningOptions.some((o) => o.month === props.period)) {
      props.onChange(earningOptions[0].month);
    }
    // Correct period query string on mounted
  }, []);

  return (
    <select value={props.period} onChange={(e) => props.onChange(e.target.value)} className={inputClass}>
      {earningOptions.map(({ month }) => (
        <option key={month} value={month}>
          {month}
        </option>
      ))}
    </select>
  );
}

function SelectDateRangePeriod(props: {
  dateRange?: {
    startDate: Date | null;
    endDate: Date | null;
  };
  onChange: (nextPeriod: string) => void;
}) {
  const [startDate, setStartDate] = useState<Date | null>(props.dateRange?.startDate ?? null);
  const [endDate, setEndDate] = useState<Date | null>(props.dateRange?.endDate ?? null);

  useEffect(() => {
    setStartDate(props.dateRange?.startDate ?? null);
    setEndDate(props.dateRange?.endDate ?? null);
  }, [props.dateRange?.startDate, props.dateRange?.endDate]);

  useEffect(() => {
    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
      return;
    }

    props.onChange(`${dayjs(startDate).format("YYYY-MM-DD")} ${dayjs(endDate).format("YYYY-MM-DD")}`);
  }, [startDate, endDate]);

  return (
    <div className="flex gap-1">
      <div className="flex gap-1">
        <input
          type="date"
          value={dayjs(startDate).format("YYYY-MM-DD")}
          className={inputClass}
          style={{ colorScheme: "dark" }}
          onChange={(e) => setStartDate(new Date(e.target.value))}
          max={dayjs(endDate ?? new Date()).format("YYYY-MM-DD")}
        />
        <input
          type="date"
          value={dayjs(endDate).format("YYYY-MM-DD")}
          className={inputClass}
          style={{ colorScheme: "dark" }}
          onChange={(e) => setEndDate(new Date(e.target.value))}
          min={startDate ? dayjs(startDate).format("YYYY-MM-DD") : undefined}
          max={dayjs(new Date()).format("YYYY-MM-DD")}
        />
      </div>
    </div>
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
  const { isLoading } = props;

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
      <div className="relative grid flex-1 grid-cols-[auto_1fr] items-center gap-y-2 gap-x-8 bg-slate-900 p-4">
        {isLoading ? (
          <Loader className="absolute top-0 bottom-0 left-0 right-0 m-auto" size={48} />
        ) : (
          <>
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
          </>
        )}
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

  const period = searchParams.get("period") || PastNUnitsPeriod.WEEK;

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

  const [periodType, periodRangeOption] = useMemo<[FilterType, PeriodRangeOptions]>(() => {
    const earningPeriod = earningOptions.find((earningOption) => earningOption.month === period);
    if (earningPeriod) {
      return [FilterType.Earnings, { earningPeriod }];
    }

    const dateRange = parseDateRange(period);
    if (dateRange) {
      return [FilterType.DateRange, { dateRange }];
    }

    return [FilterType.PastNUnits, { pastNUnitsPeriod: period as PastNUnitsPeriod }];
  }, [period]);

  const [filter, setFilter] = useState<FilterType>(periodType);

  useEffect(() => {
    setFilter(periodType);
  }, [periodType, periodRangeOption]);

  const chartProps = useMemo(() => {
    return createChartProps(periodType, periodRangeOption);
  }, [periodType, periodRangeOption]);

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

  const setPeriod = useCallback(
    (nextPeriod: string) => {
      if (period === nextPeriod) {
        return;
      }
      searchParams.set("period", nextPeriod);
      setSearchParams(searchParams);
    },
    [period]
  );

  useEffect(() => {
    if (!address) {
      return;
    }

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
        <div className="inline-flex w-[100%] justify-end gap-2 p-4">
          <SelectTimePeriod filter={filter} setFilter={setFilter} />
          {filter === FilterType.PastNUnits && <SelectPastNPeriod period={period} onChange={setPeriod} />}
          {filter === FilterType.Earnings && <SelectMonthPeriod period={period} onChange={setPeriod} />}
          {filter === FilterType.DateRange && (
            <SelectDateRangePeriod dateRange={periodRangeOption.dateRange} onChange={setPeriod} />
          )}
        </div>
        <Overview {...{ globalMetrics, address, perNodeMetrics, isLoading }} node={selectedNode} />
        <NodesTable metrics={perNodeMetrics} setSelectedNode={setSelectedNode} isLoading={isLoading} />
        <EarningsChart earnings={earnings} node={selectedNode} {...chartPropsFinal} />
        <RequestsChart metrics={metrics} node={selectedNode} {...chartPropsFinal} />
        <BandwidthChart metrics={metrics} node={selectedNode} {...chartPropsFinal} />
      </div>
    </div>
  );
}

export default Dashboard;
