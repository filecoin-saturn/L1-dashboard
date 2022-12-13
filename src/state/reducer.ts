import { getStoredAuthorizationToken } from "../services/statsAuthorization";
import { reducerAction } from "./actions";

export interface StateContext {
  authorizationToken: string | null;
  authModalOpen: boolean;
  nodeDetails: string | null;
  statsAutoRefresh: boolean;
  nodes: any[] | null;
}

export const initialState: StateContext = {
  authorizationToken: getStoredAuthorizationToken(),
  authModalOpen: false,
  nodeDetails: null,
  statsAutoRefresh: true,
  nodes: null,
};

export default function reducer(state: StateContext = initialState, action: reducerAction) {
  switch (action.type) {
    case "OPEN_AUTH_MODAL":
      return { ...state, authModalOpen: true };
    case "CLOSE_AUTH_MODAL":
      return { ...state, authModalOpen: false };
    case "STATS_AUTO_REFRESH_TOGGLE":
      return { ...state, statsAutoRefresh: !state.statsAutoRefresh };
    case "USER_AUTHENTICATED":
      return { ...state, authModalOpen: false, authorizationToken: action.authorizationToken };
    case "USER_DEAUTHENTICATED":
      return { ...state, authModalOpen: false, authorizationToken: null };
    case "OPEN_NODE_DETAILS":
      return { ...state, nodeDetails: action.id };
    case "CLOSE_NODE_DETAILS":
      return { ...state, nodeDetails: null };
    case "STATS_LOADED":
      return { ...state, nodes: action.nodes };
    default:
      throw new Error("unhandled action type in reducer");
  }
}
