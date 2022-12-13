import { useParams, useNavigate } from "react-router-dom";
import NodeDetails from "../../components/NodeDetails/NodeDetails";
import StatsGrid from "../../components/StatsGrid/StatsGrid";
import useStats from "../../services/useStats";
import { useContext, useEffect } from "react";
import { DispatchContext, StateContext } from "../../state/Context";
import Spinner from "../../components/Spinner";

export default function Stats() {
  const params = useParams();
  const dispatch = useContext(DispatchContext);
  const state = useContext(StateContext);
  const navigate = useNavigate();
  const { data, error } = useStats();

  useEffect(() => {
    if (data) {
      dispatch({ type: "STATS_LOADED", nodes: data.nodes });

      // invalid authentication token
      if (state.authorizationToken && data.admin === false) {
        sessionStorage.removeItem("authorizationToken");
        localStorage.removeItem("authorizationToken");

        dispatch({ type: "USER_DEAUTHENTICATED" });
      }
    }
  }, [data, state.authorizationToken, dispatch]);

  // check if params contain encodedState, decode it and navigate to stats page
  if (params.encodedState) {
    const savedState = JSON.parse(window.atob(params.encodedState));

    navigate("/stats", { replace: true, state: savedState });
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        Failed to load stats, please try again later.
      </div>
    );
  }

  if (state.nodes === null) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <StatsGrid />
      <NodeDetails />
    </>
  );
}
