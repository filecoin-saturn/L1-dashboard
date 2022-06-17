export interface Node {
    id: string
    active: boolean
    createdAt: Date
    updatedAt: Date
}

export interface Metric {
    startTime: Date
    numBytesMib: number
    numRequests: number
}

export interface MetricsResponse {
    nodes: Node[]
    metrics: Metric[]
}

export interface RequestInit extends globalThis.RequestInit {
    timeout?: number
}
