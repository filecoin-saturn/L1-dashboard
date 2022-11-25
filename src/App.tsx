import { Route, Routes, useLocation } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import NavBar from "./components/NavBar";
import Home from "./home/Home";
import { MODE_WEBSITE } from "@/config";

export default function App() {
  const { pathname } = useLocation();
  const isRootPage = pathname === "/";
  const showNavbar = MODE_WEBSITE && !isRootPage;

  return (
    <div className="flex h-screen flex-col">
      <NavBar className={showNavbar ? "visible" : "invisible"} />
      <div className="container mx-auto flex-1 p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/address/:address" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
}
