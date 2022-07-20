import bytes from 'bytes'
import dayjs from 'dayjs'
import type { DurationUnitType } from 'dayjs/plugin/duration'
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import * as api from '@/api'
import { MetricsResponse, TimePeriod } from '@/api.types'
import { pastDateRange } from '@/date-utils'
import RequestsChart from './RequestsChart'
import BandwidthChart from './BandwidthChart'
import EarningsChart from './EarningsChart'

interface OverviewProps {
    metricsRes: MetricsResponse
    address: string
    children?: ReactNode
}

function periodToDateOptions (period: TimePeriod) {
    let dateRange
    let step: DurationUnitType

    switch (period) {
    case TimePeriod.HOUR:
        dateRange = pastDateRange('hour')
        step = 'minute'
        break
    case TimePeriod.WEEK:
        dateRange = pastDateRange('week')
        step = 'day'
        break
    case TimePeriod.TWO_WEEK:
        dateRange = pastDateRange('week', 2)
        step = 'day'
        break
    case TimePeriod.DAY:
    default:
        dateRange = pastDateRange('day')
        step = 'hour'
        break
    // case TimePeriod.MONTH:
    //     dateRange = pastDateRange('month')
    //     break
    }

    return { dateRange, step }
}

function createChartProps (
    dateRange: { startDate: Date, endDate: Date },
    unit: DurationUnitType,
    isLoading: boolean
) {
    const xScale = {
        type: 'time',
        time: {
            unit
        },
        min: dateRange.startDate.getTime(),
        max: dateRange.endDate.getTime()
    }

    // https://github.com/chartjs/Chart.js/pull/6993
    // Break the line chart when missing a data point.
    const spanGaps = dayjs.duration(1, unit).asMilliseconds()

    return { dateRange, xScale, spanGaps, isLoading }
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
    const { dateRange, step } = periodToDateOptions(period)
    const { startDate, endDate } = dateRange

    // Don't update charts until data is fetched.
    // It looks weird if charts update immediately.
    const [chartOpts, setChartOpts] = useState({ dateRange, step })

    const fetchData = async () => {
        if (!address) { return }

        try {
            setIsLoading(true)
            setError(null)

            const metricsRes = await api.fetchMetrics(
                address, startDate, endDate, step)
            setMetricsRes(metricsRes)
            setChartOpts({ dateRange, step })
        } catch (err) {
            if (err instanceof Error) {
                setError(err?.message ?? 'Error retrieving metrics.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [address, period])

    const { earnings, metrics } = metricsRes
    const chartProps = createChartProps(chartOpts.dateRange, chartOpts.step, isLoading)

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
