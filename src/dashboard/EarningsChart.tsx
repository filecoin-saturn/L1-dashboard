import { Line } from 'react-chartjs-2'

import { Earning } from '@/api.types'
import ChartContainer, { ChartProps } from './ChartContainer'
import { ChartOptions } from 'chart.js'

interface EarningsChartProps extends ChartProps {
    earnings: Earning[]
}

export default function EarningsChart (props: EarningsChartProps) {
    const { earnings, xScale, isLoading, spanGaps } = props
    const options: ChartOptions<'line'> = {
        plugins: {
            title: {
                display: true,
                text: 'Earnings'
            },
            tooltip: {
                callbacks: {
                    label: ({ raw }) => `${Number(raw).toLocaleString()} FIL`
                }
            }
        },
        scales: {
            x: xScale,
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
                spanGaps
            }
        ]
    }

    return (
        <ChartContainer isLoading={isLoading}>
            <Line options={options} data={data} />
        </ChartContainer>
    )
}
