import bytes from 'bytes'
import dayjs from 'dayjs'
import { Line } from 'react-chartjs-2'

import { Metric } from '@/api.types'
import ChartContainer, { ChartProps } from './ChartContainer'
import { ChartOptions } from 'chart.js'

interface BandwidthChartProps extends ChartProps {
    metrics: Metric[]
}

export default function BandwidthChart (props: BandwidthChartProps) {
    const { dateRange, metrics, isLoading } = props

    const options: ChartOptions<'line'> = {
        plugins: {
            title: {
                display: true,
                text: 'Bandwidth Served'
            },
            tooltip: {
                callbacks: {
                    label: ({ raw }) => bytes(Number(raw), { unitSeparator: ' ' })
                }
            }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day'
                },
                min: dateRange.startDate.getTime(),
                max: dayjs.utc(dateRange.endDate).subtract(1, 'day').valueOf()
            },
            y: {
                ticks: {
                    callback: val => bytes(Number(val), { unitSeparator: ' ' })
                }
            }
        }
    }

    const data = {
        labels: metrics.map(m => m.startTime),
        datasets: [
            {
                data: metrics.map(m => m.numBytes)
            }
        ]
    }

    return (
        <ChartContainer isLoading={isLoading}>
            <Line options={options} data={data} />
        </ChartContainer>
    )
}
