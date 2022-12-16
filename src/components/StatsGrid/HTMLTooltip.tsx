import { ITooltipComp, ITooltipParams } from "ag-grid-community";

export default class HTMLTooltip implements ITooltipComp {
  eGui: any;
  init(params: ITooltipParams & { className: string }) {
    const eGui = (this.eGui = document.createElement("div"));
    eGui.classList.add(...["ag-tooltip"].concat((params.className ?? "").split(" ").filter(Boolean)));

    if (Array.isArray(params.value)) {
      if (params.value.length) {
        this.eGui.innerHTML = `<ul class="space-y-1"><li>${params.value.join("</li><li>")}</li></ul>`;
      }
    } else {
      this.eGui.innerHTML = params.value;
    }
  }

  getGui() {
    return this.eGui;
  }
}
