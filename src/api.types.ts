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

export interface NodeStats {
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

export enum TimePeriod {
  DAY = "1 Day",
  WEEK = "7 Days",
  TWO_WEEK = "14 Days",
  MONTH = "30 Days",
  THREE_MONTHS = "90 Days",
  ONE_YEAR = "365 Days",
}

export enum PayoutStatus {
  Postponed = "postponed",
  Pending = "pending",
  Valid = "valid",
}
