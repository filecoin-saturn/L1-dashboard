import Loader from '@/components/Loader'
import { ReactNode } from 'react'

export interface ChartProps {
    isLoading: boolean
    dateRange: {
        startDate: Date
        endDate: Date
    }
}

export interface ChartContainerProps {
    isLoading: boolean
    children: ReactNode
}

export default function ChartContainer (props: ChartContainerProps) {
    return (
        <div className={`relative max-w-[600px] w-[100%] h-[300px] p-4 pt-2
            bg-slate-900 rounded`}>
            {props.isLoading && <Loader className="absolute right-2 top-2" />}
            {props.children}
        </div>
    )
}
