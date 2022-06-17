import bytes from 'bytes'
import dayjs from 'dayjs'
import { Line } from 'react-chartjs-2'

import { Earning } from '@/api.types'
import ChartContainer from './ChartContainer'
import { ChartOptions } from 'chart.js'

interface EarningsChartProps {
    earnings: Earning[]
    dateRange: {
        startDate: Date
        endDate: Date
    }
}

export default function EarningsChart ({ earnings, dateRange }: EarningsChartProps) {
    const options: ChartOptions = {
        responsive: true,
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
        <ChartContainer>
            <Line options={options} data={data} />
        </ChartContainer>
    )
}
