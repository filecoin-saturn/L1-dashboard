export default function Loader () {
    const style = {
        width: '48px',
        height: '48px',
        border: '3px solid #e2e8f0',
        borderBottomColor: 'transparent',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'rotation 1s linear infinite'
    }
    return (<span style={style}></span>)
}
