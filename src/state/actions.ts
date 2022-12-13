export interface openAuthModalAction {
  type: "OPEN_AUTH_MODAL";
}

export interface closeAuthModalAction {
  type: "CLOSE_AUTH_MODAL";
}

export interface userAuthenticatedAction {
  type: "USER_AUTHENTICATED";
  authorizationToken: string | null;
}

export interface userDeauthenticatedAction {
  type: "USER_DEAUTHENTICATED";
}

export interface openNodeDetailsAction {
  type: "OPEN_NODE_DETAILS";
  id: string;
}

export interface closeNodeDetailsAction {
  type: "CLOSE_NODE_DETAILS";
}

export interface statsAutoRefreshToggleAction {
  type: "STATS_AUTO_REFRESH_TOGGLE";
}

export interface statsLoadedAction {
  type: "STATS_LOADED";
  nodes: any[];
}

export type reducerAction =
  | openAuthModalAction
  | closeAuthModalAction
  | userAuthenticatedAction
  | userDeauthenticatedAction
  | openNodeDetailsAction
  | closeNodeDetailsAction
  | statsAutoRefreshToggleAction
  | statsLoadedAction;
