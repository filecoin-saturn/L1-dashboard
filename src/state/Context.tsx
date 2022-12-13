import { createContext, useReducer, ReactNode } from "react";
import reducer, { initialState } from "./reducer";

export const StateContext = createContext(initialState);
export const DispatchContext = createContext<any>(() => undefined);

export default function ContextProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
}
