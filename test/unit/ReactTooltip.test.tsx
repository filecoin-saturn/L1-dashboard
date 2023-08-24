import ReactTooltip from ".././../src/components/StatsGrid/ReactTooltip";
import { it, describe, expect } from "vitest";
import { ITooltipParams } from "ag-grid-community";

describe("ReactTooltip", () => {
  it("returns the eGui element from getGui", () => {
    const tooltip: ITooltipParams<any, any> | any = new ReactTooltip();
    tooltip.init({
      value: <span>Tooltip Content</span>,
    });
    const eGui = tooltip.getGui();

    expect(eGui).toBe(tooltip.eGui);
  });
});
