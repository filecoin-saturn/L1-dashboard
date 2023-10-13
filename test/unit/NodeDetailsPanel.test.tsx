import { render, screen, fireEvent } from "@testing-library/react";
import { DispatchContext, StateContext } from "../../src/state/Context";
import { initialState } from "../../src/state/reducer";
import { it, describe, expect, vi } from "vitest";
import NodeDetailsPanel from "../../src/components/NodeDetails/NodeDetails";
import { mockNodeDetailsPanelState } from "./mock";

const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}));

vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

describe("<NodeDetailsPanel />", () => {
  const mockDispatch = vi.fn();

  const renderWithState = (state = {}) => {
    render(
      <DispatchContext.Provider value={mockDispatch}>
        <StateContext.Provider value={{ ...initialState, ...state }}>
          <NodeDetailsPanel />
        </StateContext.Provider>
      </DispatchContext.Provider>
    );
  };

  it("should not render the panel if no nodeDetails in the state", () => {
    renderWithState();
    const nodeDetailsElement = screen.queryByTestId("node-details"); // use queryByTestId to avoid throwing error
    expect(nodeDetailsElement).toBeNull();
  });

  it("should render the panel with node details if nodeDetails is in the state", () => {
    renderWithState(mockNodeDetailsPanelState);
    expect(screen.getByTestId("node-details")).toBeInTheDocument();
  });

  it("should close the panel when close button is clicked", () => {
    renderWithState(mockNodeDetailsPanelState);
    fireEvent.click(screen.getByTestId("close-panel"));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "CLOSE_NODE_DETAILS" });
  });
});
