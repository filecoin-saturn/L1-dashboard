import Loader from '@/components/Loader'
import { ReactNode } from 'react'

export interface ChartProps {
    isLoading: boolean
    dateRange: {
        startDate: Date
        endDate: Date
    }
    children?: ReactNode
}

export default function ChartContainer (props: ChartProps) {
    return (
        <div className={`relative max-w-[600px] w-[100%] h-[300px] p-4 bg-slate-900 border-2
            border-slate-500 rounded`}>
            {props.isLoading && <Loader className="absolute right-2 top-2" />}
            {props.children}
        </div>
    )
}
