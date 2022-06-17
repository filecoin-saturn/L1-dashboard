import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import Loader from '@/components/Loader'
import * as api from '@/api'
import { MetricsResponse } from '@/api.types'
import { pastDateRange } from '@/date-utils'

function Dashboard () {
    const { address } = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [metrics, setMetrics] = useState<MetricsResponse>({})
    const [{ startDate, endDate }, setDateRange] = useState(pastDateRange())

    useEffect(() => {
        (async () => {
            if (!address) { return }

            try {
                setIsLoading(true)
                setError(null)

                const metricsRes = await api.fetchMetrics(
                    address, startDate, endDate)
                setMetrics(metricsRes)
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
        body = 'Show graph'
    }

    return (
        <div className="flex flex-col items-center pt-12">
            {body}
        </div>
    )
}

export default Dashboard
