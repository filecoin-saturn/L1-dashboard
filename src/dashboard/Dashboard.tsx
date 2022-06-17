import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import Loader from '@/components/Loader'
import * as api from '@/api'
import { MetricsResponse } from '@/api.types'
import { pastDateRange } from '@/date-utils'
import RequestsChart from './RequestsChart'
import BandwidthChart from './BandwidthChart'
import EarningsChart from './EarningsChart'

function Dashboard () {
    const { address } = useParams()
    // TODO: Differentiate between initial load and subsequent auto loads
    // Do what digital ocean does
    // * refresh on tab focus after being idle for > 1 minute?
    // * refresh on interval
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [{ earnings, nodes, metrics }, setMetricsRes] = useState<MetricsResponse>({})
    const [dateRange, setDateRange] = useState(pastDateRange())

    useEffect(() => {
        (async () => {
            if (!address) { return }

            try {
                setIsLoading(true)
                setError(null)

                const { startDate, endDate } = dateRange
                const metricsRes = await api.fetchMetrics(
                    address, startDate, endDate)
                setMetricsRes(metricsRes)
            } catch (err) {
                setError(err?.message ?? 'Error retrieving metrics.')
            } finally {
                setIsLoading(false)
            }
        })()
    }, [])

    let body
    if (isLoading) {
        body = <Loader />
    } else if (error) {
        body = <p>Error: {error}</p>
    } else if (!Object.keys(metrics).length) {
        body = (
            <>
                <p>No data found for this address</p>
                <p>{address}</p>
            </>
        )
    } else {
        const commonProps = { dateRange, isLoading }
        body = (
            <div className="flex flex-wrap justify-center gap-4">
                <EarningsChart earnings={earnings} {...commonProps} />
                <RequestsChart metrics={metrics} {...commonProps} />
                <BandwidthChart metrics={metrics} {...commonProps} />
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center pt-12">
            {body}
        </div>
    )
}

export default Dashboard
