import bytes from "bytes";
import { AgGridReact } from "ag-grid-react";
import { useEffect, useRef, useState } from "react";
import ChartContainer from "./ChartContainer";
import HTMLTooltip from "../../../components/StatsGrid/HTMLTooltip";
import {
  CopyIcon,
  ListUnorderedIcon,
  CheckCircleFillIcon,
  ClockFillIcon,
  ProjectRoadmapIcon,
} from "@primer/octicons-react";
import copy from "copy-text-to-clipboard";
import classNames from "classnames";
import { Column, ITooltipParams, ValueGetterParams, ICellRendererParams, ColDef } from "ag-grid-community";

import GridButton from "../../../components/StatsGrid/GridButton";
import { PAYOUT_STATUS_MAPPING } from "..";
import { NodeStats, PayoutStatus } from "../../../api.types";
import { useWindowWidthIsSmallerThan } from "../../../hooks/useWindowSize";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import { shortenNumber } from "../../../utils/shortenNumber";

interface NodeTableProps {
  metrics: NodeStats[];
  isLoading: boolean;
}

interface NodeStatsParams extends NodeStats {
  idShort: string;
}

// Chart config must take into account that earnings are calculated once per day
export default function NodeTable(props: NodeTableProps) {
  const { address = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const periodFilter = searchParams.get("period");
  const [rowData, setRowData] = useState(props.metrics);
  const gridRef = useRef<AgGridReact>(null);
  const isCard = useWindowWidthIsSmallerThan(1024);

  const getSelectedNodeIdUrl = (nodeId: string) => {
    return `/address/${address}/${nodeId}${periodFilter ? `?period=${periodFilter}` : ""}`;
  };

  const renderStatusTooltip = (status: PayoutStatus) => {
    switch (status) {
      case PayoutStatus.Postponed:
        return `(${PAYOUT_STATUS_MAPPING[status]}) Earnings for this node are postponed to the following month due to late node registration`;
      case PayoutStatus.Pending:
        return `(${PAYOUT_STATUS_MAPPING[status]}) Earnings for this node this month are pending until the uptime requirement is satisfied`;
      case PayoutStatus.Valid:
        return `(${PAYOUT_STATUS_MAPPING[status]}) Earnings for this node are valid for this month`;
    }
  };

  const renderPayoutIcon = (status: PayoutStatus) => {
    switch (status) {
      case PayoutStatus.Postponed:
        return <ClockFillIcon className="cursor-pointer text-gray-300" />;
      case PayoutStatus.Pending:
        return <ClockFillIcon className="cursor-pointer text-yellow-300" />;
      case PayoutStatus.Valid:
        return <CheckCircleFillIcon className="cursor-pointer text-green-500" />;
    }
  };

  // columns for Card
  const cardColumnDef: ColDef<NodeStats> = {
    maxWidth: 40,
    suppressSizeToFit: true,
    cellRenderer: (params: ICellRendererParams<NodeStatsParams>) => {
      if (address) {
        return (
          <Link className="w-20" to={params?.data?.nodeId ? getSelectedNodeIdUrl(params?.data?.nodeId) : ""}>
            <ProjectRoadmapIcon className={classNames("cursor-pointer text-slate-600 hover:text-slate-500")} />
          </Link>
        );
      }
    },
    tooltipValueGetter: () => "Render node info",
  };
  // common columns
  const commonColumnDefs: ColDef<NodeStats>[] = [
    {
      field: "nodeId",
      filter: true,
      floatingFilter: true,
      tooltipComponent: HTMLTooltip,
      maxWidth: !isCard ? 95 : 120,
      headerTooltip: "<div> Unique ID of the node </div>",

      cellRenderer: (params: ICellRendererParams<NodeStatsParams>) => {
        if (address) {
          return (
            <div className={classNames({ "group relative": !isCard, "flex justify-around": isCard })}>
              <Link className="w-20" to={params?.data?.nodeId ? getSelectedNodeIdUrl(params?.data?.nodeId) : ""}>
                {params?.data?.idShort}
              </Link>
              <button
                className={classNames({ "invisible absolute -right-2 group-hover:visible": !isCard })}
                type="button"
                onClick={() => params?.data?.nodeId && copy(params?.data?.nodeId)}
              >
                <CopyIcon className="block cursor-pointer text-slate-600 hover:text-slate-500 " />
              </button>
            </div>
          );
        }
      },
      valueGetter: (params: ValueGetterParams<NodeStats>) => {
        return params.data?.nodeId;
      },
      tooltipValueGetter: (params: ITooltipParams<NodeStats>) => {
        return [`Full ID: ${params?.data?.nodeId}`];
      },
    },
    {
      field: "filEarned",
      headerName: `Estimated Earnings ${!isCard ? "(FIL)" : ""}`,
      headerTooltip: "Estimated Earnings (FIL)",
      sortable: true,
      maxWidth: !isCard ? 75 : undefined,
      cellRenderer: (params: ICellRendererParams<NodeStatsParams>) => {
        return `${params?.data?.filAmount.toLocaleString()} ${isCard ? "FIL" : ""}`;
      },
      valueGetter: (params: ValueGetterParams<NodeStats>) => {
        return params?.data?.filAmount;
      },
      tooltipValueGetter: (params: ITooltipParams<NodeStats>) => {
        return params?.data?.filAmount;
      },
    },
    {
      field: "payoutStatus",
      headerName: "Payout Eligibility",
      headerTooltip: "Payout Eligibility",
      maxWidth: !isCard ? 70 : undefined,
      cellRenderer: (params: ICellRendererParams<NodeStatsParams>) => {
        const payoutStatus = params?.data?.payoutStatus;
        if (payoutStatus) {
          return isCard ? (
            PAYOUT_STATUS_MAPPING[payoutStatus]
          ) : (
            <div className="flex h-full items-center justify-center">
              {renderPayoutIcon(payoutStatus as PayoutStatus)}
            </div>
          );
        }
      },
      tooltipValueGetter: (params: ITooltipParams<NodeStats>) => {
        return [params?.data?.payoutStatus ? renderStatusTooltip(params?.data?.payoutStatus as PayoutStatus) : ""];
      },
    },
    {
      field: "numBytes",
      headerName: "Bandwidth Served",
      headerTooltip: " Bandwidth Served ",
      sortable: true,
      maxWidth: !isCard ? 75 : undefined,
      cellRenderer: (params: ICellRendererParams<NodeStatsParams>) => {
        return params?.data?.numBytes && bytes(params?.data?.numBytes, { unitSeparator: " " });
      },
      tooltipValueGetter: (params: ITooltipParams<NodeStats>) => {
        return params?.data?.numBytes && bytes(params?.data?.numBytes, { unitSeparator: " " });
      },
    },
    {
      field: "numRequests",
      headerName: "Retrievals",
      headerTooltip: " Retrievals ",
      sortable: true,
      maxWidth: !isCard ? 70 : undefined,
      cellRenderer: (params: ICellRendererParams<NodeStatsParams>) => {
        if (params?.data?.numRequests) {
          return isCard
            ? params.data.numRequests.toLocaleString()
            : shortenNumber(params?.data?.numRequests).toLocaleString();
        }
      },
      tooltipValueGetter: (params: ITooltipParams<NodeStats>) => {
        return [params?.data?.numRequests];
      },
    },
  ];

  const [columnDefs, setColumnDefs] = useState<ColDef<NodeStats>[]>(
    isCard ? [cardColumnDef, ...commonColumnDefs] : commonColumnDefs
  );

  useEffect(() => {
    setRowData(props.metrics);
    setColumnDefs(isCard ? [cardColumnDef, ...commonColumnDefs] : commonColumnDefs);
  }, [props.metrics, isCard]);

  if (gridRef.current && gridRef.current.api) {
    const allColumnIds: Array<string> = [];
    const skipHeader = false;
    gridRef.current.columnApi.getColumns()?.forEach((column: Column) => {
      allColumnIds.push(column.getId());
    });
    gridRef.current.columnApi.autoSizeColumns(allColumnIds, skipHeader);
  }

  return (
    <div className="inline-flex h-full w-full justify-center lg:w-[420px] ">
      <ChartContainer isLoading={props.isLoading} fullHeight={!isCard}>
        <div>
          <GridButton
            onClick={() => navigate(`/address/${address}${periodFilter ? `?period=${periodFilter}` : ""}`)}
            className="m-2 min-w-[155px]"
          >
            <ListUnorderedIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" /> Reset Charts to Include All Nodes
          </GridButton>
        </div>
        <div className="ag-theme-balham-dark ag-theme-saturn h-full w-auto max-w-[600px] pb-10">
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
    </div>
  );
}
