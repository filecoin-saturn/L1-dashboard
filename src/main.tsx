import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ROUTER_BASE_PATH } from "./config";
import "./chartjs";
import "./index.css";

window.cl = console.log.bind(console);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename={ROUTER_BASE_PATH}>
    <App />
  </BrowserRouter>
);
