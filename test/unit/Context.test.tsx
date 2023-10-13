import { it, describe, expect, vi } from "vitest";
import { StateContext, DispatchContext } from "../../src/state/Context";
import { render } from "@testing-library/react";
import { useContext } from "react";

describe("ContextProvider", () => {
  it("provides state and dispatch through context", () => {
    const mockState: number | any = { count: 0 };
    const mockDispatch = vi.fn();

    const TestComponent = () => {
      const state = useContext(StateContext);
      const dispatch = useContext(DispatchContext);

      expect(state).toBe(mockState);
      expect(dispatch).toBe(mockDispatch);

      return null;
    };

    render(
      <StateContext.Provider value={mockState}>
        <DispatchContext.Provider value={mockDispatch}>
          <TestComponent />
        </DispatchContext.Provider>
      </StateContext.Provider>
    );
  });
});
