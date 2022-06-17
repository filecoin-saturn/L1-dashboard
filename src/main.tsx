import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './chartjs'
import './chartjs-dayjs-adapter'
import './index.css'

window.cl = console.log.bind(console)

const basename = window.location.hostname === 'dashboard.strn.network'
    ? '/'
    : '/webui/' // Assume inside filecoin station

ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter basename={basename}>
        <App />
    </BrowserRouter>
)
