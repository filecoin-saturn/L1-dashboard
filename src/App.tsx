import { Route, Routes, useLocation } from 'react-router-dom'
import Dashboard from './views/Dashboard'
import NavBar from './components/NavBar'
import Home from './views/Home'

export default function App () {
    const { pathname } = useLocation()

    return (
        <div className="flex flex-col h-screen">
            <NavBar className={pathname === '/' ? 'invisible' : 'visible'}/>
            <div className="flex-1 container mx-auto p-2">
                <Routes>
                    <Route path="/" element={<Home/>} />
                    <Route path="/dashboard/:address" element={<Dashboard/>} />
                </Routes>
            </div>
        </div>
    )
}
