import { render, screen, fireEvent, act } from "@testing-library/react";
import { DispatchContext, StateContext } from "../../src/state/Context";
import { it, describe, expect, vi, beforeEach } from "vitest";
import { initialState } from "../../src/state/reducer";
import StatsGridActions from "../../src/components/StatsGrid/StatsGridActions";
import copy from "copy-text-to-clipboard";

vi.mock("copy-text-to-clipboard");

describe("StatsGridActions", () => {
  const mockDispatch = vi.fn();
  const mockGridApi = {
    setFilterModel: vi.fn(),
    getFilterModel: vi.fn().mockReturnValue({}),
    sizeColumnsToFit: vi.fn(),
  };
  const mockColumnApi = {
    resetColumnState: vi.fn(),
    getColumnState: vi.fn().mockReturnValue([]),
    setColumnsVisible: vi.fn(),
    sizeColumnsToFit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (state = {}) => {
    render(
      <DispatchContext.Provider value={mockDispatch}>
        <StateContext.Provider value={{ ...initialState, ...state }}>
          <StatsGridActions gridApi={mockGridApi} columnApi={mockColumnApi} />
        </StateContext.Provider>
      </DispatchContext.Provider>
    );
  };

  it("handles reset filters", () => {
    const state = {
      statsAutoRefresh: false,
      authorizationToken: null,
    };
    renderComponent(state);
    act(() => {
      fireEvent.click(screen.getByText("Reset filters"));
    });
    expect(mockGridApi.setFilterModel).toHaveBeenCalled();
    expect(mockColumnApi.resetColumnState).toHaveBeenCalled();
  });

  it("handles stats auto refresh toggle", () => {
    const state = {
      statsAutoRefresh: false,
      authorizationToken: null,
    };
    renderComponent(state);
    act(() => {
      fireEvent.click(screen.getByText("Enable Auto Refresh"));
    });
    expect(mockDispatch).toHaveBeenCalledWith({ type: "STATS_AUTO_REFRESH_TOGGLE" });
  });

  it("handles share current grid", () => {
    const state = {
      statsAutoRefresh: false,
      authorizationToken: null,
    };
    vi.useFakeTimers();
    renderComponent(state);
    act(() => {
      fireEvent.click(screen.getByText("Share Current Grid"));
    });
    expect(copy).toHaveBeenCalled();
    vi.runAllTimers();
    expect(screen.getByText("Copied to clipboard!")).toBeInTheDocument();
  });

  it("handles deAuthentication", () => {
    const state = {
      statsAutoRefresh: false,
      authorizationToken: "someToken",
    };
    renderComponent(state);
    act(() => {
      fireEvent.click(screen.getByText("Admin Authenticated"));
    });
    expect(mockDispatch).toHaveBeenCalledWith({ type: "USER_DEAUTHENTICATED" });
  });

  it("handles authentication", () => {
    const state = {
      statsAutoRefresh: false,
      authorizationToken: null,
    };
    renderComponent(state);
    act(() => {
      fireEvent.click(screen.getByText("Admin Auth"));
    });
    expect(mockDispatch).toHaveBeenCalledWith({ type: "OPEN_AUTH_MODAL" });
  });
});
