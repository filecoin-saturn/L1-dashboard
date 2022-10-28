import bytes from 'bytes'
import dayjs from 'dayjs'
import type { DurationUnitType } from 'dayjs/plugin/duration'
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

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

function createChartProps (period: TimePeriod) {
    let dateRange
    let step: DurationUnitType // group by this time unit
    let labelUnit: DurationUnitType

    switch (period) {
    case TimePeriod.MONTH:
        dateRange = pastDateRange('day', 30)
        step = 'day'
        labelUnit = 'day'
        break
    case TimePeriod.TWO_WEEK:
        dateRange = pastDateRange('week', 2)
        step = 'hour'
        labelUnit = 'day'
        break
    case TimePeriod.WEEK:
        dateRange = pastDateRange('week')
        step = 'hour'
        labelUnit = 'day'
        break
    case TimePeriod.DAY:
    default:
        dateRange = pastDateRange('day')
        step = 'hour'
        labelUnit = step
        break
    }

    const xScale = {
        type: 'time',
        time: {
            unit: labelUnit
        },
        min: dateRange.startDate.getTime(),
        max: dateRange.endDate.getTime()
    }

    // https://github.com/chartjs/Chart.js/pull/6993
    // Break the line chart when missing a data point.
    const spanGaps = dayjs.duration(1, step).asMilliseconds()

    return { dateRange, xScale, step, spanGaps, isLoading: false }
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
    const numActiveNodes = nodes.find(d => d.state === 'active')?.count ?? 0
    const numInactiveNodes = nodes.find(d => d.state === 'inactive')?.count ?? 0
    const numDownNodes = nodes.find(d => d.state === 'down')?.count ?? 0

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
                    {numDownNodes > 0 && `, ${numDownNodes} Down`}
                </div>
                <div>Estimated Earnings</div><div>{totalEarnings.toLocaleString()} FIL</div>
                <div>Bandwidth</div><div>{bytes(totalBandwidth, { unitSeparator: ' ' })}</div>
                <div>Retrievals</div><div>{totalRetrievals.toLocaleString()}</div>
            </div>
        </div>
    )
}

function Dashboard () {
    const { address = '' } = useParams()
    const [searchParams, setSearchParams] = useSearchParams()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<null | string>(null)

    const defaultPeriod = searchParams.get('period') as TimePeriod ?? TimePeriod.WEEK
    const [period, setPeriod] = useState<TimePeriod>(defaultPeriod)
    const [
        metricsRes, setMetricsRes
    ] = useState<MetricsResponse>({ earnings: [], nodes: [], metrics: [] })

    const chartProps = createChartProps(period)

    // Don't update chart axes until data is fetched.
    // It looks weird if axes update before data does.
    const [chartPropsFinal, setChartPropsFinal] = useState(chartProps)
    chartPropsFinal.isLoading = isLoading

    useEffect(() => {
        if (!address) { return }

        searchParams.set('period', period)
        setSearchParams(searchParams)

        const controller = new AbortController()

        const fetchData = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const { startDate, endDate } = chartProps.dateRange

                const metricsRes = await api.fetchMetrics(
                    address, startDate, endDate, chartProps.step, controller.signal)
                setMetricsRes(metricsRes)
                setChartPropsFinal(chartProps)
            } catch (err) {
                if (err instanceof Error && !controller.signal.aborted) {
                    setError(err?.message ?? 'Error retrieving metrics.')
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false)
                }
            }
        }

        fetchData()

        return () => controller.abort()
    }, [address, period])

    const { earnings, metrics } = metricsRes

    return (
        <div className="flex-1 flex flex-col gap-4 mt-8">
            {error && <p className="text-center text-red-600 text-lg">Error: {error}</p>}
            <div className="flex flex-wrap justify-center gap-12">
                <Overview {...{ metricsRes, address }}>
                    <SelectTimePeriod period={period} setPeriod={setPeriod}/>
                </Overview>
                <EarningsChart earnings={earnings} {...chartPropsFinal} />
                <RequestsChart metrics={metrics} {...chartPropsFinal} />
                <BandwidthChart metrics={metrics} {...chartPropsFinal} />
            </div>
        </div>
    )
}

export default Dashboard
