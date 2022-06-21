import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './chartjs'
import './index.css'

window.cl = console.log.bind(console)

const webDomain = `dashboard.${import.meta.env.VITE_ROOT_DOMAIN}`

const basename = window.location.hostname === webDomain
    ? '/'
    : '/webui/' // Assume inside filecoin station

ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter basename={basename}>
        <App />
    </BrowserRouter>
)
