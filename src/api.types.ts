export interface Node {
  state: "active" | "inactive" | "draining" | "down";
  count: number;
}

export interface Metric {
  timeStamp: Date;
  numBytes: number;
  numRequests: number;
}

export interface Earning {
  timestamp: Date;
  filAmount: number;
}

interface NodeStats {
  nodeId: string;
  filAmount: number;
  numBytes: number;
  numRequests: number;
  payoutStatus: string;
  uptimeCompletion: number | undefined;
  state: string;
}
export interface GlobalStats {
  totalEarnings: number;
  totalRetrievals: number;
  totalBandwidth: number;
}

export interface MetricsResponse {
  metrics: Metric[];
  earnings: Earning[];
  data?: any;
}

export interface FetchAllResponse extends MetricsResponse {
  globalStats: GlobalStats;
  perNodeMetrics: Array<NodeStats>;
  nodes: Node[];
}
export interface GlobalMetrics {
  totalEarnings: number;
  totalRetrievals: number;
  totalBandwidth: number;
  perNodeMetrics: Array<NodeStats>;
  nodes: Node[];
}

export interface RequestInit extends globalThis.RequestInit {
  timeout?: number;
}

export enum PastNUnitsPeriod {
  DAY = "Past 24 hours",
  WEEK = "Past 7 days",
  MONTH = "Past 30 days",
  THREE_MONTHS = "Past 90 days",
  ONE_YEAR = "Past 365 days",
}

export enum TimePeriod {
  PastNUnitsPeriod = "Past N Days",
  EarningsPeriod = "Earning period",
  Range = "Date range",
}

export interface EarningsPeriod {
  month: string;
  date: Date;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export enum FilterType {
  PastNUnits = "PastNUnitsPeriod",
  Earnings = "EarningsPeriod",
  DateRange = "Range",
}
