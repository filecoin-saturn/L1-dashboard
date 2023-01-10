import { AgGridReact } from "ag-grid-react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { DispatchContext, StateContext } from "../../state/Context";
import { columnDefs } from "./StatsGridConfig";
import StatsGridActions from "./StatsGridActions";

export default function StatsGrid() {
  const state = useContext(StateContext);
  const dispatch = useContext(DispatchContext);
  const location = useLocation();
  const [gridApi, setGridApi] = useState<any>(null);
  const [columnApi, setColumnApi] = useState<any>(null);

  const onGridReady = useCallback(
    (params: any) => {
      setGridApi(params.api);
      setColumnApi(params.columnApi);
    },
    [setGridApi, setColumnApi]
  );

  const autoSizeAllColumns = useCallback(() => {
    if (columnApi) {
      columnApi.autoSizeAllColumns();
    }
  }, [columnApi]);

  useEffect(() => {
    if (columnApi) {
      columnApi.setColumnsVisible(["operator"], Boolean(state.authorizationToken));
      columnApi.autoSizeAllColumns();
    }
  }, [columnApi, state.authorizationToken]);

  useEffect(() => {
    if (gridApi && columnApi && location.state) {
      const { f: filters, s: sort } = location.state;

      gridApi.setFilterModel(filters);
      columnApi.applyColumnState({ state: sort });
    }
  }, [gridApi, columnApi, location.state]);

  const context = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <>
      <StatsGridActions gridApi={gridApi} columnApi={columnApi} />
      <div className="ag-theme-balham-dark ag-theme-saturn h-full w-auto">
        <AgGridReact
          context={context}
          rowHeight={52}
          rowData={state.nodes}
          suppressCellFocus={true}
          columnDefs={columnDefs}
          enableCellTextSelection={true}
          ensureDomOrder={true}
          suppressColumnVirtualisation={true}
          onModelUpdated={autoSizeAllColumns}
          onGridSizeChanged={autoSizeAllColumns}
          onFirstDataRendered={autoSizeAllColumns}
          onFilterChanged={autoSizeAllColumns}
          getRowId={(params) => params.data.id}
          onGridReady={onGridReady}
          tooltipShowDelay={0}
        ></AgGridReact>
      </div>
    </>
  );
}
