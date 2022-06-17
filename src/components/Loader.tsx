export default function Loader (props: { size?: number, className?: string }) {
    const { size = 16, className = '' } = props
    const style = {
        width: `${size}px`,
        height: `${size}px`,
        border: '2px solid #e2e8f0',
        borderBottomColor: 'transparent',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'rotation 1s linear infinite'
    }
    return (<span style={style} className={className}></span>)
}
