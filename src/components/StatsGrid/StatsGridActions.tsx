import copy from "copy-text-to-clipboard";
import { FilterIcon, LockIcon, ShareIcon, SyncIcon, UnlockIcon } from "@primer/octicons-react";
import GridButton from "./GridButton";
import { useContext, useState } from "react";
import { DispatchContext, StateContext } from "../../state/Context";
import { openAuthModalAction } from "../../state/actions";

export default function StatsGridActions({ gridApi, columnApi }: any) {
  const dispatch = useContext(DispatchContext);
  const state = useContext(StateContext);
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  const handleAuthentication = () => {
    const action: openAuthModalAction = { type: "OPEN_AUTH_MODAL" };

    dispatch(action);
  };

  const handleResetFilters = () => {
    if (gridApi && columnApi) {
      gridApi.setFilterModel(null);
      columnApi.resetColumnState();
      columnApi.setColumnsVisible(["operator"], Boolean(state.authorizationToken));
      gridApi.sizeColumnsToFit();
    }
  };

  const handleStatsAutoRefreshToggle = () => {
    dispatch({ type: "STATS_AUTO_REFRESH_TOGGLE" });
  };

  const handleShareGrid = () => {
    if (gridApi && columnApi) {
      const filterModel = gridApi.getFilterModel();
      const columnState = columnApi.getColumnState();
      const sortState = columnState
        .filter((state: any) => state.sort !== null)
        .map((state: any) => ({
          colId: state.colId,
          sort: state.sort,
          sortIndex: state.sortIndex,
        }));

      const model = { f: filterModel, s: sortState };
      const encoded = window.btoa(JSON.stringify(model));

      copy(`${window.location.href}/${encoded}`);

      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const handleDeauthentication = () => {
    sessionStorage.removeItem("authorizationToken");
    localStorage.removeItem("authorizationToken");

    dispatch({ type: "USER_DEAUTHENTICATED" });
  };

  return (
    <div className="m-2 mt-0 flex justify-center space-x-2">
      <GridButton testId="reset-filters-button" onClick={handleResetFilters}>
        <FilterIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" /> Reset filters
      </GridButton>

      <GridButton testId="share-grid-button" onClick={handleShareGrid} className="min-w-[150px]">
        <ShareIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />{" "}
        {shareCopied ? "Copied to clipboard!" : "Share Current Grid"}
      </GridButton>

      <GridButton testId="auto-refresh-toggle" onClick={handleStatsAutoRefreshToggle} className="min-w-[155px]">
        <SyncIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />{" "}
        {state.statsAutoRefresh ? "Disable Auto Refresh" : "Enable Auto Refresh"}
      </GridButton>

      {state.authorizationToken ? (
        <GridButton onClick={handleDeauthentication}>
          <UnlockIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" /> Admin Authenticated
        </GridButton>
      ) : (
        <GridButton testId="admin-auth" onClick={handleAuthentication}>
          <LockIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" /> Admin Auth
        </GridButton>
      )}
    </div>
  );
}
