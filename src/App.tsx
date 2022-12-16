import { Navigate, Route, Routes } from "react-router-dom";
import AuthenticateModal from "./components/AuthenticateModal";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/dashboard";
import Home from "./pages/home";
import Stats from "./pages/stats";

const defaultRoute = import.meta.env.VITE_MODE_WEBUI ? "/address" : "/stats";

export default function App() {
  return (
    <div className="flex h-screen flex-col">
      {/* display navigation only in website mode (no navigation when embedded) */}
      {import.meta.env.VITE_MODE_WEBUI ? null : <NavBar />}
      <Routes>
        <Route path="/" element={<Navigate to={defaultRoute} replace={true} />} />
        <Route path="/stats" element={<Stats />}>
          {/* stats route with encoded state in url param */}
          <Route path=":encodedState" element={<Stats />} />
        </Route>
        <Route path="/address" element={<Home />} />
        <Route path="/address/:address" element={<Dashboard />} />
      </Routes>
      <AuthenticateModal />
    </div>
  );
}
