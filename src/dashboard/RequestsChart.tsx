import dayjs from 'dayjs'
import { Line } from 'react-chartjs-2'

import { Metric } from '@/api.types'
import ChartContainer, { ChartProps } from './ChartContainer'
import { ChartOptions } from 'chart.js'

interface RequestsChartProps extends ChartProps {
    metrics: Metric[]
}

export default function RequestsChart (props: RequestsChartProps) {
    const { metrics, dateRange, isLoading } = props
    const options: ChartOptions<'line'> = {
        plugins: {
            title: {
                display: true,
                text: 'Number of Retrievals'
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
            }
        }
    }

    const data = {
        labels: metrics.map(m => m.startTime),
        datasets: [
            {
                data: metrics.map(m => m.numRequests)
            }
        ]
    }

    return (
        <ChartContainer isLoading={isLoading}>
            <Line options={options} data={data} />
        </ChartContainer>
    )
}
