import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import NodesTable from "../../src/pages/dashboard/components/NodesTable";
import { it, describe, expect, vi, afterEach } from "vitest";
import copy from "copy-text-to-clipboard";
import bytes from "bytes";
import { PAYOUT_STATUS_MAPPING } from "../../src/pages/dashboard";

vi.mock("copy-text-to-clipboard");

describe("NodesTable", () => {
  const mockProps = {
    metrics: [
      {
        nodeId: "123456",
        idShort: "1234",
        filAmount: 100,
        payoutStatus: "valid",
        numBytes: 5000,
        numRequests: 10,
      },
    ],
    isLoading: false,
  };

  const setSelectedNode = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProps = (prop = {}) => {
    const props = { ...mockProps, ...prop };
    render(<NodesTable {...props} setSelectedNode={setSelectedNode} />);
  };

  it("renders the node ID correctly", () => {
    renderWithProps();
    expect(screen.getByText("1234")).toBeInTheDocument();
  });

  it("copies the nodeId to clipboard on copy button click", () => {
    renderWithProps();
    const copyButton = screen.getByTestId("node-table-copy-icon");
    fireEvent.click(copyButton);
    expect(copy).toHaveBeenCalled();
  });
  it("renders the estimated earnings correctly", () => {
    renderWithProps();
    expect(screen.getByText("100 FIL")).toBeInTheDocument();
  });

  it("renders the payout eligibility correctly", () => {
    renderWithProps();
    expect(screen.getByText(PAYOUT_STATUS_MAPPING[mockProps.metrics[0].payoutStatus])).toBeInTheDocument();
  });

  it("renders the bandwidth served correctly", () => {
    renderWithProps();
    // Assuming bytes function from 'bytes' library converts 5000 to '5 KB' for simplicity
    expect(screen.getByText(bytes(mockProps.metrics[0].numBytes, { unitSeparator: " " }))).toBeInTheDocument();
  });

  it("renders the retrievals correctly", () => {
    renderWithProps();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("triggers the reset charts function when clicked", () => {
    renderWithProps();
    const resetButton = screen.getByRole("button", { name: /Reset Charts to Include All Nodes/i });
    fireEvent.click(resetButton);
    expect(setSelectedNode).toHaveBeenCalledWith(null);
  });
});
