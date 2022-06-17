import bytes from 'bytes'
import dayjs from 'dayjs'
import { Line } from 'react-chartjs-2'

import { Metric } from '@/api.types'
import ChartContainer from './ChartContainer'
import { ChartOptions } from 'chart.js'

interface BandwidthChartProps {
    metrics: Metric[]
    dateRange: {
        startDate: Date
        endDate: Date
    }
}

const fmtBytes = (val: number) => bytes(val * 2 ** 20, { unitSeparator: ' ' })

export default function BandwidthChart ({ metrics, dateRange }: BandwidthChartProps) {
    const options: ChartOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Bandwidth Served'
            },
            tooltip: {
                callbacks: {
                    label: ({ raw }) => fmtBytes(Number(raw))
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
                    callback: val => fmtBytes(Number(val))
                }
            }
        }
    }

    const data = {
        labels: metrics.map(m => m.startTime),
        datasets: [
            {
                data: metrics.map(m => m.numBytesMib)
            }
        ]
    }

    return (
        <ChartContainer>
            <Line options={options} data={data} />
        </ChartContainer>
    )
}
