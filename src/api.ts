import { RequestInit, MetricsResponse } from './api.types'

const METRICS_ORIGIN = import.meta.env.VITE_METRICS_ORIGIN ?? 'https://ln3tnkd4d5uiufjgimi6jlkmci0bceff.lambda-url.us-west-2.on.aws/'

/**
 * Fetch API wrapper that throws on 400+ http status.
 */
export async function wfetch (resource: RequestInfo | URL, opts: RequestInit = {}) {
    if (Number.isFinite(opts.timeout)) {
        const controller = new AbortController()
        opts.signal = controller.signal
        setTimeout(() => controller.abort(), opts.timeout)
    }

    const response = await fetch(resource, opts)

    if (response.status >= 400) {
        let message = await response.json().then(d => d.message).catch(() => null)
        message = `${message ?? (response.statusText || response.status)}`

        throw new Error(message)
    }

    return response
}

export async function fetchMetrics (
    filAddress: string, startDate: Date, endDate: Date, step: string, signal: AbortSignal
) {
    const url = new URL(METRICS_ORIGIN)
    url.searchParams.set('filAddress', filAddress)
    url.searchParams.set('startDate', `${startDate.getTime()}`)
    url.searchParams.set('endDate', `${endDate.getTime()}`)
    url.searchParams.set('step', step)

    const res: MetricsResponse = await wfetch(url, { signal }).then(r => r.json())

    res.earnings.forEach(e => {
        e.earningsDate = new Date(e.earningsDate)
    })
    res.metrics.forEach(m => {
        m.startTime = new Date(m.startTime)
    })

    return res
}
