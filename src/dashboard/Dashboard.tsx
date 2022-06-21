import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import * as api from '@/api'
import { MetricsResponse, TimePeriod } from '@/api.types'
import { pastDateRange } from '@/date-utils'
import RequestsChart from './RequestsChart'
import BandwidthChart from './BandwidthChart'
import EarningsChart from './EarningsChart'
import bytes from 'bytes'

interface OverviewProps {
    metricsRes: MetricsResponse
    address: string
    children?: ReactNode
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

function SelectTimePeriod (
    props: {
        period: TimePeriod,
        setPeriod: Dispatch<SetStateAction<TimePeriod>>
    }
) {
    const options = Object.values(TimePeriod)

    return (
        <select
            value={props.period}
            onChange={e => props.setPeriod(e.target.value as TimePeriod)}
            className="bg-slate-900 p-1 rounded">
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    )
}

function Overview (props: OverviewProps) {
    const { earnings, nodes, metrics } = props.metricsRes

    // Might be worth using useMemo here if data sets become large.
    const totalEarnings = earnings.reduce((memo, earning) => memo + earning.filAmount, 0)
    const totalBandwidth = metrics.reduce((memo, metric) => memo + metric.numBytes, 0)
    const totalRetrievals = metrics.reduce((memo, metric) => memo + metric.numRequests, 0)
    const numActiveNodes = nodes.find(d => d.active)?.count ?? 0
    const numInactiveNodes = nodes.find(d => !d.active)?.count ?? 0

    return (
        <div className="flex flex-col max-w-[600px] w-[100%] h-[300px] rounded">
            <div className="flex items-center justify-between bg-[#0066B4] py-2 px-4 text-lg">
                Overview
                {props.children}
            </div>
            <div className="flex-1 grid grid-cols-[auto_1fr] gap-y-2 gap-x-8 p-4 items-center bg-slate-900">
                <div>Address</div><div className="truncate">{props.address}</div>
                <div>Nodes</div>
                <div>
                    {numActiveNodes.toLocaleString()} Active
                    {numInactiveNodes > 0 && `, ${numInactiveNodes} Inactive`}
                </div>
                <div>Earnings</div><div>{totalEarnings.toLocaleString()} FIL</div>
                <div>Bandwidth</div><div>{bytes(totalBandwidth, { unitSeparator: ' ' })}</div>
                <div>Retrievals</div><div>{totalRetrievals.toLocaleString()}</div>
            </div>
        </div>
    )
}

function Dashboard () {
    const { address = '' } = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<null | string>(null)

    const [
        metricsRes, setMetricsRes
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
            if (err instanceof Error) {
                setError(err?.message ?? 'Error retrieving metrics.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [address, startDate.getTime(), endDate.getTime()])

    const { earnings, metrics } = metricsRes
    const chartProps = { dateRange: chartDateRange, isLoading }

    return (
        <div className="flex-1 flex flex-col gap-4 mt-8">
            {error && <p className="text-center text-red-600 text-lg">Error: {error}</p>}
            <div className="flex flex-wrap justify-center gap-12">
                <Overview {...{ metricsRes, address }}>
                    <SelectTimePeriod period={period} setPeriod={setPeriod}/>
                </Overview>
                <EarningsChart earnings={earnings} {...chartProps} />
                <RequestsChart metrics={metrics} {...chartProps} />
                <BandwidthChart metrics={metrics} {...chartProps} />
            </div>
        </div>
    )
}

export default Dashboard
