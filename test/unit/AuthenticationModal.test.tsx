import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DispatchContext, StateContext } from "../../src/state/Context";
import { it, describe, expect, vi, beforeEach } from "vitest";
import AuthenticateModal from "../../src/components/AuthenticateModal";
import { initialState } from "../../src/state/reducer";

const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}));

vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

describe("<AuthenticateModal />", () => {
  const mockDispatch = vi.fn();

  beforeEach(() => {
    render(
      <StateContext.Provider value={{ ...initialState, authModalOpen: true }}>
        <DispatchContext.Provider value={mockDispatch}>
          <AuthenticateModal />
        </DispatchContext.Provider>
      </StateContext.Provider>
    );
  });

  it("should render the authentication modal when authModalOpen is true", () => {
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should dispatch "CLOSE_AUTH_MODAL" action when esc button is hit', async () => {
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({ type: "CLOSE_AUTH_MODAL" });
    });
  });
});
