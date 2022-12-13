import ReactDOM from "react-dom/client";
import { ITooltipComp, ITooltipParams } from "ag-grid-community";

export default class ReactTooltip implements ITooltipComp {
  eGui: any;

  init(params: ITooltipParams) {
    const eGui = (this.eGui = document.createElement("div"));

    eGui.classList.add("ag-tooltip");

    const root = ReactDOM.createRoot(eGui);
    root.render(params.value);
  }

  getGui() {
    return this.eGui;
  }
}
