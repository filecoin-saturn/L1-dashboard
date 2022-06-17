import { RequestInit, MetricsResponse } from './api.types'

const METRICS_ORIGIN = import.meta.env.METRICS_ORIGIN ?? 'https://ttnqmmizksmixmxdkf75p4g7640tfuux.lambda-url.us-west-2.on.aws/'

export class FetchError extends Error {
    response: Response | undefined
}

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
        const error = new FetchError(`${response.statusText || response.status}`)
        error.response = response
        throw error
    }

    return response
}

export function fetchEarnings () {

}

export async function fetchMetrics (filAddress: string, startDate: Date, endDate: Date) {
    const url = new URL(METRICS_ORIGIN)
    url.searchParams.set('filAddress', filAddress)
    url.searchParams.set('startDate', `${startDate.getTime()}`)
    url.searchParams.set('endDate', `${endDate.getTime()}`)

    const res: MetricsResponse = await wfetch(url).then(r => r.json())
    res.metrics.forEach(m => {
        m.startTime = new Date(m.startTime)
    })
    res.nodes.forEach(n => {
        n.createdAt = new Date(n.createdAt)
        n.updatedAt = new Date(n.updatedAt)
    })
    return res
}