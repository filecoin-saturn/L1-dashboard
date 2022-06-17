import { ReactNode } from 'react'

export default function ChartContainer (props: { children: ReactNode }) {
    return (
        <div className="w-[600px] p-4 bg-slate-900 border-2 border-slate-500 rounded">
            {props.children}
        </div>
    )
}
