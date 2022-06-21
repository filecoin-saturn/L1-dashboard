import dayjs from 'dayjs'
import { Line } from 'react-chartjs-2'

import { Earning } from '@/api.types'
import ChartContainer, { ChartProps } from './ChartContainer'
import { ChartOptions } from 'chart.js'

interface EarningsChartProps extends ChartProps {
    earnings: Earning[]
}

export default function EarningsChart (props: EarningsChartProps) {
    const { earnings, dateRange, isLoading } = props
    const options: ChartOptions = {
        plugins: {
            title: {
                display: true,
                text: 'FIL Earnings'
            },
            tooltip: {
                callbacks: {
                    label: ({ raw }) => `${raw} FIL`
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
                    callback: val => `${val} FIL`
                }
            }
        }
    }

    const data = {
        labels: earnings.map(e => e.earningsDate),
        datasets: [
            {
                data: earnings.map(e => e.filAmount),
                spanGaps: 1000 * 60 * 60 * 24 // 1 day,
            }
        ]
    }

    return (
        <ChartContainer isLoading={isLoading}>
            <Line options={options} data={data} />
        </ChartContainer>
    )
}
