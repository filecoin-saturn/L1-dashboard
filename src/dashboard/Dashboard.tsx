import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import * as api from '@/api'
import { MetricsResponse, TimePeriod } from '@/api.types'
import { pastDateRange } from '@/date-utils'
import RequestsChart from './RequestsChart'
import BandwidthChart from './BandwidthChart'
import EarningsChart from './EarningsChart'

interface HeaderProps {
    address: string
    period: TimePeriod,
    setPeriod: Dispatch<SetStateAction<TimePeriod>>
}

function periodToDateRange (period: TimePeriod) {
    switch (period) {
    case TimePeriod.WEEK:
        return pastDateRange('week')
    case TimePeriod.TWO_WEEK:
        return pastDateRange('week', 2)
    case TimePeriod.MONTH:
        return pastDateRange('month')
    // case TimePeriod.SIX_MONTH:
    //     return pastDateRange('month', 6)
    }
}

function Header ({ address, period, setPeriod }: HeaderProps) {
    const options = Object.values(TimePeriod)

    return (
        <div className="flex justify-center items-center gap-4 pb-12">
            <select
                value={period}
                onChange={e => setPeriod(e.target.value as TimePeriod)}
                className="bg-slate-900 p-2 rounded">
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    )
}

function Dashboard () {
    const { address } = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    const [
        { earnings, nodes, metrics }, setMetricsRes
    ] = useState<MetricsResponse>({ earnings: [], nodes: [], metrics: [] })

    const [period, setPeriod] = useState<TimePeriod>(TimePeriod.WEEK)
    const dateRange = periodToDateRange(period)
    const { startDate, endDate } = dateRange

    // Don't update chart axes until data is fetched.
    // It looks weird if axes update immediately.
    const [chartDateRange, setChartDateRange] = useState(dateRange)

    const fetchData = async () => {
        if (!address) { return }

        try {
            setIsLoading(true)
            setError(null)

            const metricsRes = await api.fetchMetrics(
                address, startDate, endDate)
            setMetricsRes(metricsRes)
            setChartDateRange(dateRange)
        } catch (err) {
            setError(err?.message ?? 'Error retrieving metrics.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [address, startDate.getTime(), endDate.getTime()])

    const chartProps = { dateRange: chartDateRange, isLoading }

    return (
        <div className="flex-1 flex flex-col gap-4 pt-4">
            {/* {error && <p className="text-center text-lg">Error: {error}</p>} */}
            <Header {...{ address, period, setPeriod }}/>
            <div className="flex flex-wrap justify-center gap-4">
                <EarningsChart earnings={earnings} {...chartProps} />
                <RequestsChart metrics={metrics} {...chartProps} />
                <BandwidthChart metrics={metrics} {...chartProps} />
            </div>
        </div>
    )
}

export default Dashboard
