import { Route, Routes, useLocation } from 'react-router-dom'
import Dashboard from './dashboard/Dashboard'
import NavBar from './components/NavBar'
import Home from './home/Home'

export default function App () {
    const { pathname } = useLocation()

    return (
        <div className="flex flex-col h-screen">
            <NavBar className={pathname === '/' ? 'invisible' : 'visible'}/>
            <div className="flex-1 container mx-auto p-4">
                <Routes>
                    <Route path="/" element={<Home/>} />
                    <Route path="/address/:address" element={<Dashboard/>} />
                </Routes>
            </div>
        </div>
    )
}
