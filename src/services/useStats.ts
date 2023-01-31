import { useContext } from "react";
import useSWR, { SWRConfiguration } from "swr";
import { StateContext } from "../state/Context";

const middleware = (data: { admin: boolean; nodes: any[] }) => {
  // enrich node with calculated properties
  data.nodes.forEach((node) => {
    node.idShort = node.id.split("-")[0]; // short id (first section of guid)
    node.versionShort = node.version.split("_")[0]; // short version (just first vXXX section)
    node.ispShort = (node.speedtest?.isp ?? "Unknown ISP").split(" ").slice(0, 2).join(" ");
    if (node.ttfbStats.reqs_served_1h) {
      node.cacheRate1h = node.ttfbStats.hits_1h / node.ttfbStats.reqs_served_1h;
      node.errorRate1h = node.ttfbStats.errors_1h / node.ttfbStats.reqs_served_1h;
    } else {
      node.cacheRate1h = node.errorRate1h = node.ttfbStats.reqs_served_1h === 0 ? 0 : null;
    }
    if (node.ttfbStats.reqs_served_24h) {
      node.cacheRate24h = node.ttfbStats.hits_24h / node.ttfbStats.reqs_served_24h;
      node.errorRate24h = node.ttfbStats.errors_24h / node.ttfbStats.reqs_served_24h;
    } else {
      node.cacheRate24h = node.errorRate24h = node.ttfbStats.reqs_served_24h === 0 ? 0 : null;
    }
    node.HealthCheckFailures = node.HealthCheckFailures ?? []; // ensure that this property is defined
    node.memoryUsed = node.memoryStats.totalMemory - node.memoryStats.availableMemory;
    node.cpuAvgLoad = node.cpuStats.loadAvgs[1];

    // sort health check failures by creation date (most recent first)
    node.HealthCheckFailures.sort((a: any, b: any) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  });

  return data;
};

const fetcher = async ([url, authorizationToken]: string[]) => {
  const headers: HeadersInit = new Headers();
  headers.set("Accept", "application/json");
  if (authorizationToken) {
    headers.set("Authorization", authorizationToken);
  }
  const response = await fetch(url, { headers });
  const data = await response.json();

  return middleware(data);
};

export default function useStats(config?: SWRConfiguration) {
  const state = useContext(StateContext);

  return useSWR([`${import.meta.env.VITE_STATS_ORIGIN}/stats?sortColumn=id`, state.authorizationToken], fetcher, {
    refreshWhenHidden: false,
    revalidateOnMount: state.statsAutoRefresh,
    revalidateOnFocus: state.statsAutoRefresh,
    revalidateOnReconnect: state.statsAutoRefresh,
    refreshInterval: state.statsAutoRefresh ? 10000 : 0, // refresh every 10 seconds when enabled
    ...config,
  });
}
