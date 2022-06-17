export default function Loader () {
    const style = {
        width: '48px',
        height: '48px',
        border: '5px solid #FFF',
        borderBottomColor: 'transparent',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'rotation 1s linear infinite'
    }
    return (<span style={style}></span>)
}
