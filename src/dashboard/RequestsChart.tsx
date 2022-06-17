import dayjs from 'dayjs'
import { Line } from 'react-chartjs-2'

import { Metric } from '@/api.types'
import ChartContainer from './ChartContainer'
import { ChartOptions } from 'chart.js'

interface RequestsChartProps {
    metrics: Metric[]
    dateRange: {
        startDate: Date
        endDate: Date
    }
}

export default function RequestsChart ({ metrics, dateRange }: RequestsChartProps) {
    const options: ChartOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Total Retrievals'
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
        <ChartContainer>
            <Line options={options} data={data} />
        </ChartContainer>
    )
}
