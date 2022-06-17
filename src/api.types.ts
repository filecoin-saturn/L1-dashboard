export interface Node {
    active: boolean
    count: number
}

export interface Metric {
    startTime: Date
    numBytesMib: number
    numRequests: number
}

export interface Earning {
    earningsDate: Date
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
    WEEK = '7 Days',
    MONTH = '1 Month',
    SIX_MONTH = '6 Months'
}
