import bytes from 'bytes'
import { Line } from 'react-chartjs-2'

import { Metric } from '@/api.types'
import ChartContainer, { ChartProps } from './ChartContainer'
import { ChartOptions } from 'chart.js'

interface BandwidthChartProps extends ChartProps {
    metrics: Metric[]
}

export default function BandwidthChart (props: BandwidthChartProps) {
    const { xScale, metrics, isLoading, spanGaps } = props

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
            x: xScale,
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
                data: metrics.map(m => m.numBytes),
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
