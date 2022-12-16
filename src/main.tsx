import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./chartjs";
import "./index.css";
import ContextProvider from "./state/Context";

window.cl = console.log.bind(console);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename={import.meta.env.VITE_MODE_WEBUI ? "/webui/" : "/"}>
    <ContextProvider>
      <App />
    </ContextProvider>
  </BrowserRouter>
);
