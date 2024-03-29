import bytes from "bytes";
import { AgGridReact } from "ag-grid-react";
import { useEffect, useRef, useState } from "react";
import ChartContainer from "./ChartContainer";
import HTMLTooltip from "../../../components/StatsGrid/HTMLTooltip";

import { CopyIcon, ProjectRoadmapIcon, ListUnorderedIcon } from "@primer/octicons-react";
import copy from "copy-text-to-clipboard";
import classNames from "classnames";
import GridButton from "../../../components/StatsGrid/GridButton";
import { PAYOUT_STATUS_MAPPING } from "..";

// Chart config must take into account that earnings are calculated once per day
export default function NodesTable(props: any) {
  const setSelectedNode = props.setSelectedNode;
  const [rowData, setRowData] = useState(props.metrics);
  const gridRef = useRef<any>(null);

  const renderStatusTooltip = (status: string) => {
    switch (status) {
      case "postponed":
        return "Earnings for this node are postponed to the following month due to late node registration";
      case "pending":
        return "Earnings for this node this month are pending until the uptime requirement is satisfied";
      case "valid":
        return "Earnings for this node are valid for this month";
    }
  };
  const [columnDefs] = useState([
    {
      width: 40,
      suppressSizeToFit: true,
      cellRenderer: (params: any) => {
        return (
          <button type="button" onClick={() => setSelectedNode(params.data.nodeId)}>
            <ProjectRoadmapIcon className={classNames("cursor-pointer text-slate-600 hover:text-slate-500")} />
          </button>
        );
      },
      tooltipValueGetter: () => "Render node info",
    },
    {
      field: "nodeId",
      filter: true,
      floatingFilter: true,
      tooltipComponent: HTMLTooltip,
      minWidth: 120,
      headerTooltip: "<div> Unique ID of the node </div>",

      cellRenderer: (params: any) => {
        return (
          <>
            <div>
              <button className="w-20"> {params.data.idShort} </button>
              {"   "}

              <button type="button" onClick={() => copy(params.data.nodeId)}>
                <CopyIcon className="cursor-pointer text-slate-600 hover:text-slate-500" />
              </button>
            </div>
          </>
        );
      },
      valueGetter: (params: any) => {
        return params.data.idShort;
      },
      tooltipValueGetter: (params: any) => {
        return [`Full ID: ${params.data.nodeId}`];
      },
    },
    {
      field: "filEarned",
      headerName: "Estimated Earnings",
      sortable: true,
      cellRenderer: (params: Record<any, any>) => {
        return `${params.data.filAmount.toLocaleString()} FIL`;
      },
      valueGetter: (params: any) => {
        return params.data.filAmount;
      },
    },
    {
      field: "payoutStatus",
      headerName: "Payout Eligibility",
      width: 110,
      cellRenderer: (params: any) => {
        const payoutStatus = params.data.payoutStatus;

        return PAYOUT_STATUS_MAPPING[payoutStatus];
      },
      tooltipValueGetter: (params: any) => {
        return [renderStatusTooltip(params.data.payoutStatus)];
      },
    },
    {
      field: "numBytes",
      headerName: "Bandwidth Served",
      sortable: true,
      cellRenderer: (params: any) => {
        return bytes(params.data.numBytes, { unitSeparator: " " });
      },
    },
    {
      field: "numRequests",
      headerName: "Retrievals",
      sortable: true,
      cellRenderer: (params: any) => {
        return params.data.numRequests.toLocaleString();
      },
    },
  ]);

  useEffect(() => {
    setRowData(props.metrics);
  }, [props.metrics]);

  if (gridRef.current && gridRef.current.api) {
    const allColumnIds: Array<any> = [];
    const skipHeader = false;
    gridRef.current.columnApi.getColumns().forEach((column: any) => {
      allColumnIds.push(column.getId());
    });
    gridRef.current.columnApi.autoSizeColumns(allColumnIds, skipHeader);
  }

  return (
    <ChartContainer isLoading={props.isLoading}>
      <div>
        <GridButton onClick={() => setSelectedNode(null)} className="m-2 min-w-[155px]">
          <ListUnorderedIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" /> Reset Charts to Include All Nodes
        </GridButton>
      </div>
      <div className="ag-theme-balham-dark ag-theme-saturn h-full max-h-72 w-auto max-w-[600px]">
        <AgGridReact
          ref={gridRef}
          rowData={props.isLoading ? undefined : rowData}
          columnDefs={columnDefs}
          tooltipShowDelay={0} // show without delay on mouse enter
          tooltipHideDelay={99999} // do not hide unless mouse leaves
          overlayNoRowsTemplate={props.isLoading ? "<span />" : undefined}
          suppressLoadingOverlay={true}
        />
      </div>
    </ChartContainer>
  );
}
