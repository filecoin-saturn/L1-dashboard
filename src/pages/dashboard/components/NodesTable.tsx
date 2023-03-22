import bytes from "bytes";
import { AgGridReact } from "ag-grid-react";
import { useEffect, useState } from "react";
import ChartContainer from "./ChartContainer";
import HTMLTooltip from "../../../components/StatsGrid/HTMLTooltip";

import { CopyIcon, ProjectRoadmapIcon, SyncIcon } from "@primer/octicons-react";
import copy from "copy-text-to-clipboard";
import classNames from "classnames";
import GridButton from "../../../components/StatsGrid/GridButton";

// Chart config must take into account that earnings are calculated once per day
export default function NodesTable(props: any) {
  const setSelectedNode = props.setSelectedNode;
  const [rowData, setRowData] = useState(props.metrics);

  const [columnDefs] = useState([
    {
      width: 40,
      suppressSizeToFit: true,
      tooltipValueGetter: () => "Render node info",
      cellRenderer: (params: any) => {
        return (
          <button type="button" onClick={() => setSelectedNode(params.data.nodeId)}>
            <ProjectRoadmapIcon className={classNames("cursor-pointer text-slate-600 hover:text-slate-500")} />
          </button>
        );
      },
    },
    {
      field: "nodeId",
      filter: true,
      floatingFilter: true,
      tooltipComponent: HTMLTooltip,
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

  return (
    <ChartContainer isLoading={false}>
      <div>
        <GridButton onClick={() => setSelectedNode(null)} className="m-2 min-w-[155px]">
          <SyncIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" /> Reset Charts to Global
        </GridButton>
      </div>
      <div className="ag-theme-balham-dark ag-theme-saturn h-full max-h-72 w-auto max-w-[600px]">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          tooltipShowDelay={0} // show without delay on mouse enter
          tooltipHideDelay={99999} // do not hide unless mouse leaves
        ></AgGridReact>
      </div>
    </ChartContainer>
  );
}
