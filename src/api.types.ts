export interface Node {
    state: 'active' | 'inactive' | 'draining' | 'down'
    count: number
}

export interface Metric {
    startTime: Date
    numBytes: number
    numRequests: number
}

export interface Earning {
    timestamp: Date
    filAmount: number
}

export interface MetricsResponse {
    nodes: Node[]
    metrics: Metric[]
    earnings: Earning[]
}

export interface RequestInit extends globalThis.RequestInit {
    timeout?: number
}

export enum TimePeriod {
    // HOUR = '1 Hour',
    DAY = '1 Day',
    WEEK = '7 Days',
    TWO_WEEK = '14 Days',
    MONTH = '30 Days',
    // TODO: Need to optimize db for 6 month query.
    // SIX_MONTH = '6 Months'
}
