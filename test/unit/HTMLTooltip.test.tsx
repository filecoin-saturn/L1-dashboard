import HTMLTooltip from ".././../src/components/StatsGrid/HTMLTooltip";
import { it, describe, expect } from "vitest";
import { ITooltipParams } from "ag-grid-community";

describe("HTMLTooltip", () => {
  const mockTooltipParams: (ITooltipParams<any, any> & { className: string }) | any = {
    value: "Tooltip Content",
    className: "custom-class",
  };

  it("initializes the tooltip content correctly", () => {
    const tooltip = new HTMLTooltip();
    tooltip.init(mockTooltipParams);
    const eGui = tooltip.eGui;

    expect(eGui).toHaveClass("ag-tooltip");
    expect(eGui).toHaveClass("custom-class");
    expect(eGui).toHaveTextContent("Tooltip Content");
  });

  it("renders an unordered list for an array of values", () => {
    const mockArrayParams: (ITooltipParams<any, any> & { className: string }) | any = {
      value: ["Item 1", "Item 2", "Item 3"],
      className: "custom-class",
    };

    const tooltip = new HTMLTooltip();
    tooltip.init(mockArrayParams);

    const eGui = tooltip.eGui;

    expect(eGui.innerHTML).toContain("<ul");
    expect(eGui.innerHTML).toContain("<li>Item 1</li>");
    expect(eGui.innerHTML).toContain("<li>Item 2</li>");
    expect(eGui.innerHTML).toContain("<li>Item 3</li>");
  });

  it("renders an empty div if value is an empty array", () => {
    const mockEmptyArrayParams: (ITooltipParams<any, any> & { className: string }) | any = {
      value: [],
      className: "custom-class",
    };

    const tooltip = new HTMLTooltip();
    tooltip.init(mockEmptyArrayParams);

    const eGui = tooltip.eGui;

    expect(eGui.innerHTML).toBe("");
  });

  it("returns the eGui element from getGui", () => {
    const tooltip = new HTMLTooltip();
    tooltip.init(mockTooltipParams);

    const eGui = tooltip.getGui();

    expect(eGui).toBe(tooltip.eGui);
  });
});
