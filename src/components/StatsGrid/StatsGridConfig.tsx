import { CopyIcon, ProjectRoadmapIcon } from "@primer/octicons-react";
import bytes from "bytes";
import classNames from "classnames";
import copy from "copy-text-to-clipboard";
import { Link } from "react-router-dom";
import HTMLTooltip from "./HTMLTooltip";

// helper wrapper functions to format tooltip html content
const htmlWrapper = (text: string, className = "") => `<div class="${className}">${text}</div>`;
const htmlItalic = (text: string, className = "") => `<span class="italic ${className}">${text}</span>`;
const htmlListItem = (text: string, className = "") => `<li class="${className}">${text}</li>`;
const htmlBold = (text: string, className = "") => `<span class="font-bold ${className}">${text}</span>`;
const htmlSeparator = (className = "") => `<hr class="my-2 bg-slate-600 h-[1px] border-0 ${className}" />`;

/**
 * Convert an object to an array of strings.
 * @param object object to convert to an array of strings
 * @param filter optional filter function to exclude keys from the output
 * @returns array of strings in the format "key: value"
 */
function asStrings(object: any, filter?: any): any {
  const entries = Object.entries(object).reduce((acc: any, [key, value]) => {
    // filter out unwanted keys
    if (filter && !filter(key, value)) return acc;

    // replace underscores with spaces and split camelCase with spaces
    return [...acc, `${key.replaceAll("_", " ").replace(/([a-z])([A-Z])/g, "$1 $2")}: ${value}`];
  }, []);

  // sort keys alphabetically to maintain consistency
  entries.sort((a: any, b: any) => {
    if (a < b) return -1;
    if (b > a) return 1;
    return 0;
  });

  return entries;
}

/**
 * Format a number as a percentage.
 * @param fraction number between 0 and 1
 * @returns string representation of fraction as a percentage
 */
const asPercent = (fraction: number) => {
  return fraction.toLocaleString("en", { style: "percent" });
};

export const columnDefs = [
  {
    width: 40,
    suppressSizeToFit: true,
    tooltipValueGetter: () => "View node details",
    cellRenderer: (params: any) => {
      const action = { type: "OPEN_NODE_DETAILS", id: params.data.id };
      return (
        <button type="button" onClick={() => params.context.dispatch(action)}>
          <ProjectRoadmapIcon className={classNames("cursor-pointer text-slate-600 hover:text-slate-500")} />
        </button>
      );
    },
  },
  {
    field: "state",
    filter: true,
    floatingFilter: true,
    sortable: true,
    width: 75,
    suppressSizeToFit: true,
    cellRenderer: (params: any) => {
      const className = classNames({
        "text-green-500": params.value === "active",
        "text-red-500": params.value === "down",
        "text-blue-500": params.value === "draining",
        "text-gray-500": params.value === "inactive",
      });

      return <span className={className}>{params.value}</span>;
    },
    tooltipComponent: HTMLTooltip,
    headerTooltip: (() => {
      const states = [
        ["Active", "Node is active and accepting new connections."],
        [
          "Draining",
          "Node is draining connections (waiting for existing connections to finish and not accepting any new connections) most likely in preparation for a software update and graceful restart. This is a temporary state, the node will become active again after the update.",
        ],
        [
          "Inactive",
          "Node has not updated its status for a while and has been removed from the network until it reports its status again.",
        ],
        [
          "Down",
          "Node has failed at least one health check in recent minutes and has been removed from the network until it reports successful health checks again. It is also possible that node with that status has been manually blocked by the network operator for malicious activities.",
        ],
      ];

      return states
        .map(([state, info]) =>
          htmlListItem(
            htmlBold(state, "table-cell align-top pb-1 pr-1") + htmlWrapper(info, "table-cell pb-1"),
            "table-row"
          )
        )
        .join("");
    })(),
  },
  {
    field: "id",
    headerName: "ID",
    headerTooltip: (() => {
      return [
        htmlBold("Unique ID of the node (only first part of the ID is shown)."),
        htmlSeparator(),
        htmlItalic("Click the copy button to copy full ID to your clipboard."),
      ];
    })(),
    valueGetter: (params: any) => {
      let value = params.data.id;
      if (params.data.sunrise) value = `${value} sunrise 🌅️`;
      if (params.data.core) value = `${value} core ⭐️`;
      return value;
    },
    valueFormatter: (params: any) => params.data.idShort,
    cellRenderer: (params: any) => {
      return (
        <>
          <button type="button" onClick={() => copy(params.data.id)}>
            <CopyIcon className="cursor-pointer text-slate-600 hover:text-slate-500" />
          </button>{" "}
          {params.valueFormatted} {params.data.sunrise ? <span>🌅️</span> : null}
          {params.data.core ? <span>⭐️</span> : null}
        </>
      );
    },
    filter: true,
    floatingFilter: true,
    sortable: true,
    tooltipComponent: HTMLTooltip,
    tooltipValueGetter: (params: any) => {
      const tooltip = [`Full ID: ${params.data.id}`];
      if (params.data.sunrise) {
        tooltip.push("🌅️ Sunrise node");
      }
      if (params.data.core) {
        tooltip.push("⭐️ Core node");
      }
      return tooltip;
    },
  },
  {
    field: "level",
    headerName: "Type",
    tooltipComponent: HTMLTooltip,
    headerTooltip: (() => {
      return [
        htmlBold("Type and version of the node."),
        "Type can be either L1 (level 1) or L2 (level 2, not yet available).",
        "Version is incrementable number that is increased with each software update.",
      ];
    })(),
    filter: true,
    sortable: true,
    floatingFilter: true,
    valueGetter: (params: any) => {
      return `L${params.data.level} v${params.data.versionShort}`;
    },
  },
  {
    field: "ip",
    headerName: "IP & ISP",
    tooltipComponent: HTMLTooltip,
    headerTooltip: (() => {
      return [
        htmlBold("IP address and ISP of the node."),
        "IP address is obscured and not available publicly to protect the node from direct access.",
        htmlSeparator(),
        htmlItalic(
          "This data is currently provided by an external service and can be inaccurate - we are working to remedy this situation."
        ),
      ];
    })(),
    filter: true,
    floatingFilter: true,
    valueGetter: (params: any) => {
      if (params.data.ipAddress) {
        return `${params.data.ipAddress} ${params.data.ispShort}`;
      }
      return params.data.ispShort;
    },
    cellRenderer: (params: any) => {
      return (
        <>
          {params.data.ipAddress ? (
            <div className="overflow-clip text-ellipsis">
              {/* include copy button only when authenticated - doesn't make sense for obscured ip */}
              {params.context.state.authorizationToken ? (
                <button type="button" onClick={() => copy(params.data.ipAddress)} className="mr-1">
                  <CopyIcon className="cursor-pointer text-slate-600 hover:text-slate-500" />
                </button>
              ) : null}
              {params.data.ipAddress}
            </div>
          ) : null}
          <div className="overflow-clip text-ellipsis">{params.data.ispShort}</div>
        </>
      );
    },
  },
  {
    field: "location",
    headerName: "Location",
    headerTooltip: (() => {
      return [
        htmlBold("Physical location of the node based on the ip address."),
        "Location plays important role in determining node profitability. Nodes in the same location will share the traffic and therefore the revenue. It is best to set up nodes in locations that have potentially high traffic and limited coverage.",
        htmlSeparator(),
        htmlItalic(
          "This data is currently provided by an external service and can be inaccurate. Please report any mismatch on Github issues - https://github.com/filecoin-saturn/L1-dashboard/issues"
        ),
      ];
    })(),
    filter: true,
    sortable: true,
    floatingFilter: true,
    valueGetter: (params: any): string => {
      return `${params.data.geoloc.city}, ${params.data.geoloc.country} (${params.data.geoloc.countryCode})`;
    },
    cellRenderer: (params: any) => {
      return (
        <>
          <div className="overflow-clip text-ellipsis">{params.data.geoloc.city}</div>
          <div className="overflow-clip text-ellipsis">
            {params.data.geoloc.country} ({params.data.geoloc.countryCode})
          </div>
        </>
      );
    },
    tooltipComponent: HTMLTooltip,
    tooltipValueGetter: ({ data }: any) => {
      return [
        `Region: ${data.geoloc.region}`,
        `Speedtest location: ${data.speedtest.server?.location ?? "Unknown"}, ${
          data.speedtest.server?.country ?? "Unknown"
        }`,
        `Latency: ${data.speedtest.ping?.latency ?? 0}ms`,
      ];
    },
  },
  {
    field: "bias",
    headerName: "Weight",
    headerTooltip: (() => {
      return [
        htmlBold("Weigth of the node in the network."),
        "This value indicates what is the probability of the node being selected to serve the traffic - the higher the value, the higher the probability.",
        "This value is recalculated on every node registration based on number of factors including TTFB, Speedtest upload rate result, CPU load and number of cores, cache hit ratio, error rate and health check failures.",
        "For nodes joining the network it can take several days to reach the optimal value based on the nodes performance and network traffic.",
        "Consistently low weight can indicate a problem with one of the factors mentioned above - you should check whether any of the stats stick out and try to resolve the issue.",
      ];
    })(),
    sortable: true,
    filter: "agNumberColumnFilter",
    floatingFilter: true,
    minWidth: 100,
    cellRenderer: (params: any) => {
      return (
        <>
          <div
            className={classNames("overflow-clip text-ellipsis", {
              "font-bold text-red-500": params.data.bias < -90,
              "text-red-500": params.data.bias >= -90 && params.data.bias < -60,
              "text-orange-500": params.data.bias >= -60 && params.data.bias < -30,
              "text-yellow-500": params.data.bias >= -30 && params.data.bias < 0,
            })}
          >
            {params.data.bias}
          </div>
          {params.data.HealthCheckFailures.length > 0 && (
            <div
              className={classNames("overflow-clip text-ellipsis", {
                "text-red-500": params.data.HealthCheckFailures.length >= 4,
                "text-orange-500": params.data.HealthCheckFailures.length < 4,
              })}
            >
              {params.data.HealthCheckFailures.length} fail{params.data.HealthCheckFailures.length > 1 && "s"} / last
              24h
            </div>
          )}
        </>
      );
    },
    tooltipComponent: HTMLTooltip,
    tooltipValueGetter: ({ data }: any) => {
      const biases = asStrings(data.biases, (key: string, value: any) => value);

      if (data.HealthCheckFailures.length) {
        const fails = `${data.HealthCheckFailures.length} fail${
          data.HealthCheckFailures.length > 1 ? "s" : ""
        } in last 24 hours`;

        return [...biases, "<hr />", fails];
      }

      return biases;
    },
  },
  {
    field: "diskStats.usedDisk",
    headerName: "Disk Usage",
    tooltipComponent: HTMLTooltip,
    headerTooltip: (() => {
      return [htmlBold("Disk usage reported by the node."), "Disk usage does not impact the node's weight."];
    })(),
    sortable: true,
    cellRenderer: (params: any) => {
      const diskStats = params.data.diskStats;
      const usedDiskPercent = 1 - diskStats.availableDisk / diskStats.totalDisk;

      return (
        <>
          <div className="overflow-clip text-ellipsis">
            {diskStats.usedDisk} GB ({asPercent(usedDiskPercent)})
          </div>
          <div className="overflow-clip text-ellipsis">of {bytes(diskStats.totalDisk * 1024 * 1024 * 1024)}</div>
        </>
      );
    },
    tooltipValueGetter: ({ data }: any) => {
      return `Available: ${bytes(data.diskStats.availableDisk * 1000000000)}`;
    },
  },
  {
    field: "memoryUsed",
    headerName: "Memory Usage",
    headerTooltip: (() => {
      return [htmlBold("Memory usage reported by the node."), "Memory usage does not impact the node's weight."];
    })(),
    sortable: true,
    cellRenderer: (params: any) => {
      const memoryStats = params.data.memoryStats;
      const usedMemory = memoryStats.totalMemory - memoryStats.availableMemory; // Is this right?
      const usedMemoryPercent = usedMemory / memoryStats.totalMemory;

      return `${usedMemory.toLocaleString()} / ${memoryStats.totalMemory.toFixed(0)} GB (${asPercent(
        usedMemoryPercent
      )})`;
    },
    tooltipComponent: HTMLTooltip,
    tooltipValueGetter: ({ data }: any) => {
      return [`Available: ${data.memoryStats.availableMemory} GB`, `Free: ${data.memoryStats.freeMemory} GB`];
    },
  },
  {
    field: "cpuAvgLoad",
    headerName: "CPU",
    headerTooltip: (() => {
      return [
        htmlBold("CPU usage and load reported by the node."),
        "[5m avg load] / [cores] ([avg load on all cores %])",
        "CPU average load (first value) and total number of cores (second value) are included in the node's weight calculation.",
        "Tooltip: Load values correspond to the avarage load over last 1m, 5m and 15m.",
      ];
    })(),
    tooltipComponent: HTMLTooltip,
    sortable: true,
    cellRenderer: (params: any) => {
      const cpuStats = params.data.cpuStats;
      const avgLoadPercent = cpuStats.loadAvgs[1] / cpuStats.numCPUs;

      return (
        <>
          {cpuStats.loadAvgs[1]} / {cpuStats.numCPUs} ({asPercent(avgLoadPercent)})
        </>
      );
    },
    tooltipValueGetter: ({ data }: any) => {
      return `Load: ${data.cpuStats.loadAvgs.join(", ")}`;
    },
  },
  {
    field: "ttfbStats.p95_1h",
    headerName: "TTFB",
    headerTooltip: (() => {
      return [
        htmlBold("TTFB (Time To First Byte)"),
        "This is the time it takes by avarage for the node to respond to a request.",
        "1h and 24h displayed in this column are the 95th percentile of the response times from last hour and 24 hours respectively. " +
        "Both of those values are taken into account when calculating the node's weight - the lower the values the better. " +
        "These numbers are mostly impacted by cache hit rates and should improve over time when cache fills up. " +
        "High values can also mean that either node's base latency is high or error rate is high.",
        "Tooltip: More detailed percentile stats.",
      ];
    })(),
    sortable: true,
    cellRenderer: (params: any) => {
      return (
        <>
          <div className="overflow-clip text-ellipsis">
            1h:{" "}
            <span
              className={classNames({
                "font-bold text-red-500": params.data.ttfbStats.p95_1h >= 2000,
                "text-red-500": params.data.ttfbStats.p95_1h >= 1500 && params.data.ttfbStats.p95_1h < 2000,
                "text-orange-500": params.data.ttfbStats.p95_1h >= 1200 && params.data.ttfbStats.p95_1h < 1500,
                "text-yellow-500": params.data.ttfbStats.p95_1h >= 1000 && params.data.ttfbStats.p95_1h < 1200,
              })}
            >
              {params.data.ttfbStats.p95_1h ?? "NA"}
            </span>
          </div>
          <div className="overflow-clip text-ellipsis">
            24h:{" "}
            <span
              className={classNames({
                "font-bold text-red-500": params.data.ttfbStats.p95_24h >= 2000,
                "text-red-500": params.data.ttfbStats.p95_24h >= 1500 && params.data.ttfbStats.p95_24h < 2000,
                "text-orange-500": params.data.ttfbStats.p95_24h >= 1200 && params.data.ttfbStats.p95_24h < 1500,
                "text-yellow-500": params.data.ttfbStats.p95_24h >= 1000 && params.data.ttfbStats.p95_24h < 1200,
              })}
            >
              {params.data.ttfbStats.p95_24h ?? "NA"}
            </span>
          </div>
        </>
      );
    },
    tooltipComponent: HTMLTooltip,
    tooltipValueGetter: ({ data }: any) => {
      return asStrings(data.ttfbStats, (key: string) =>
        ["error", "reqs", "hits"].every((exclude) => !key.includes(exclude))
      );
    },
  },
  {
    field: "cacheRate1h",
    headerName: "Cache hit rate",
    headerTooltip: (() => {
      return [
        htmlBold("Cache hit rate of served requests."),
        "This is the percentage of requests that were served from cache.",
        "1h and 24h displayed in this column are cache hit rates from the last hour and 24 hours respectively. " +
        "Both of those values are taken into account when calculating the node's weight - the higher the values the better.",
        "These numbers are mostly impacted by the number of unique requests and should improve over time when cache fills up. " +
        "Consistently low cache hit rates can indicate that either the node is not caching requests properly (check available disk space in cache directory location) " +
        "or that the node is serving a lot of unique requests (if that is the case then other nodes in this physical location should have lowered cache hit rates too).",
        "Tooltip: Total number of requests in 1h and 24h time spans.",
      ];
    })(),
    sortable: true,
    cellRenderer: (params: any) => {
      return (
        <>
          <div className="overflow-clip text-ellipsis">
            1h:{" "}
            <span
              className={classNames({
                "font-bold text-red-500": params.data.cacheRate1h < 0.7,
                "text-red-500": params.data.cacheRate1h >= 0.7 && params.data.cacheRate1h < 0.8,
                "text-orange-500": params.data.cacheRate1h >= 0.8 && params.data.cacheRate1h < 0.9,
                "text-yellow-500": params.data.cacheRate1h >= 0.9 && params.data.cacheRate1h < 0.95,
              })}
            >
              {params.data.cacheRate1h === null ? "n/a" : asPercent(params.data.cacheRate1h)}
            </span>
          </div>
          <div className="overflow-clip text-ellipsis">
            24h:{" "}
            <span
              className={classNames({
                "font-bold text-red-500": params.data.cacheRate24h < 0.7,
                "text-red-500": params.data.cacheRate24h >= 0.7 && params.data.cacheRate24h < 0.8,
                "text-orange-500": params.data.cacheRate24h >= 0.8 && params.data.cacheRate24h < 0.9,
                "text-yellow-500": params.data.cacheRate24h >= 0.9 && params.data.cacheRate24h < 0.95,
              })}
            >
              {params.data.cacheRate24h === null ? "n/a" : asPercent(params.data.cacheRate24h)}
            </span>
          </div>
        </>
      );
    },
    tooltipComponent: HTMLTooltip,
    tooltipValueGetter: ({ data }: any) => {
      return asStrings(data.ttfbStats, (key: any) => ["reqs", "hits"].some((include) => key.includes(include)));
    },
  },
  {
    field: "errorRate1h",
    headerName: "Error rate",
    headerTooltip: (() => {
      return [
        htmlBold("Error rate of served requests."),
        "This is the percentage of requests that were responded with server or gateway error (only 5xx status codes).",
        "1h and 24h displayed in this column are error rates from last hour and 24 hours respectively. " +
        "Both of those values are taken into account when calculating the node's weight - the lower the values the better.",
        "Usually errors are caused by timeouts from ipfs.io gateway on requests to resources that were not cached yet and should improve with cache hit rates rising over time. " +
        "Consistently high error rates with high cache hit rates can indicate network or configuration issues or ipfs.io gateway issues (outages, high load or failing to retrieve content).",
        "Tooltip: Total number of requests in 1h and 24h time spans.",
      ];
    })(),
    sortable: true,
    cellRenderer: (params: any) => {
      return (
        <>
          <div className="overflow-clip text-ellipsis">
            1h:{" "}
            <span
              className={classNames({
                "font-bold text-red-500": params.data.errorRate1h >= 0.5,
                "text-red-500": params.data.errorRate1h >= 0.3 && params.data.errorRate1h < 0.5,
                "text-orange-500": params.data.errorRate1h >= 0.1 && params.data.errorRate1h < 0.3,
                "text-yellow-500": params.data.errorRate1h >= 0.01 && params.data.errorRate1h < 0.1,
              })}
            >
              {params.data.errorRate1h === null ? "n/a" : asPercent(params.data.errorRate1h)}
            </span>
          </div>
          <div className="overflow-clip text-ellipsis">
            24h:{" "}
            <span
              className={classNames({
                "font-bold text-red-500": params.data.errorRate24h >= 0.5,
                "text-red-500": params.data.errorRate24h >= 0.3 && params.data.errorRate24h < 0.5,
                "text-orange-500": params.data.errorRate24h >= 0.1 && params.data.errorRate24h < 0.3,
                "text-yellow-500": params.data.errorRate24h >= 0.01 && params.data.errorRate24h < 0.1,
              })}
            >
              {params.data.errorRate24h === null ? "n/a" : asPercent(params.data.errorRate24h)}
            </span>
          </div>
        </>
      );
    },
    tooltipComponent: HTMLTooltip,
    tooltipValueGetter: ({ data }: any) => {
      return asStrings(data.ttfbStats, (key: string) => ["reqs", "error"].some((include) => key.includes(include)));
    },
  },
  {
    field: "nicStats.bytesSent",
    headerName: "Upload",
    headerTooltip: (() => {
      return [
        htmlBold("Node upload stats and speedtest result."),
        "Total upload bandwidth is taken from the node's network interface and are updated on every node registration. This value does not impact node's weight and is only used for informational purposes.",
        "Displayed upload speed is the avergage speed calculated by dividing total upload bandwidth by the number of seconds since the node was initially registered. When this value is very close to or exceeds 10Gbps it will negatively impact node's weight to distribute the load to other nodes.",
        "Speedtest (available in tooltip) is performed only on initial node startup and the upload rate result is used to calculate the node's weight - the higher the value the better.",
        "Speedtest may not report maximum upload speed the machine is capable of which is usually fine but in case the value is much lower than expected, you can restart the node to perform speedtest again and if the values are consistently low you can also override the settings to run against specific speedtest server.",
      ];
    })(),
    sortable: true,
    cellRenderer: (params: any) => {
      const percent = params.data.uploadRate / params.data.maxSpeed;
      const percentText = params.data.maxSpeed < 100000 ? ` (${asPercent(percent)})` : "";
      return (
        <>
          <div className="overflow-clip text-ellipsis">{bytes(params.data.nicStats.bytesSent)}</div>
          <div className="overflow-clip text-ellipsis">
            @{" "}
            {params.data.uploadRate >= 1000
              ? Number((params.data.uploadRate / 1000).toFixed(1))
              : params.data.uploadRate}{" "}
            {params.data.uploadRate >= 1000 ? "Gbps" : "Mbps"}
            {percentText}
          </div>
        </>
      );
    },
    tooltipComponent: HTMLTooltip,
    tooltipValueGetter: ({ data }: any) => {
      const speedtest = `Speedtest UL: ${Math.round(
        ((data.speedtest?.upload?.bandwidth ?? 0) * 8) / 1000 / 1000
      )} Mbps`;

      if (data.maxSpeed < 100000) {
        return [`Max speed: ${data.maxSpeed} Mbps`, speedtest];
      }

      return speedtest;
    },
  },
  {
    field: "nicStats.bytesReceived",
    headerName: "Download",
    headerTooltip: (() => {
      return [
        htmlBold("Node download stats and speedtest result."),
        "Total download bandwidth is taken from the node's network interface and is updated on every node registration.",
        "Speedtest (available in tooltip) is performed only on initial node startup.",
        "None of these values are not used in node's weight calculation and are only used for informational purposes.",
      ];
    })(),
    tooltipComponent: HTMLTooltip,
    sortable: true,
    filter: "agNumberColumnFilter",
    cellRenderer: ({ data }: any) => {
      return bytes(data.nicStats.bytesReceived);
    },
    tooltipValueGetter: ({ data }: any) => {
      return `Speedtest DL: ${Math.round(((data?.speedtest?.download?.bandwidth ?? 0) * 8) / 1000 / 1000)} Mbps`;
    },
  },
  {
    field: "lastRegistration",
    headerName: "Last Registration",
    headerTooltip: (() => {
      return [
        htmlBold("Time of last successful node registration."),
        "Every node periodically reports its status to the network to make sure its operational.",
        "Nodes that did not report for a long time are pruned from the network.",
      ];
    })(),
    tooltipComponent: HTMLTooltip,
    sortable: true,
    cellRenderer: (params: any) => {
      return (
        <>
          <div className="overflow-clip text-ellipsis">
            {new Date(params.data.lastRegistration).toLocaleDateString()}
          </div>
          <div className="overflow-clip text-ellipsis">
            {new Date(params.data.lastRegistration).toLocaleTimeString()}
          </div>
        </>
      );
    },
  },
  {
    field: "createdAt",
    headerName: "Created",
    headerTooltip: (() => {
      return htmlBold("Time of initial node registration.");
    })(),
    tooltipComponent: HTMLTooltip,
    sortable: true,
    cellRenderer: (params: any) => {
      return (
        <>
          <div className="overflow-clip text-ellipsis">{new Date(params.data.createdAt).toLocaleDateString()}</div>
          <div className="overflow-clip text-ellipsis">{new Date(params.data.createdAt).toLocaleTimeString()}</div>
        </>
      );
    },
  },
  {
    field: "operator",
    headerName: "Operator",
    headerTooltip: (() => {
      return htmlBold("Node operator email and $fil wallet address.");
    })(),
    tooltipComponent: HTMLTooltip,
    filter: true,
    floatingFilter: true,
    hide: true,
    valueGetter: (params: any) => {
      return `${params.data.operatorEmail} ${params.data.filWalletAddress}`;
    },
    cellRenderer: (params: any) => {
      return (
        <>
          <button type="button" onClick={() => copy(params.data.operatorEmail)}>
            <CopyIcon className="cursor-pointer text-slate-600 hover:text-slate-500" />
          </button>{" "}
          <span className="overflow-clip text-ellipsis">{params.data.operatorEmail}</span>
          {params.data.filWalletAddress && (
            <div className="overflow-clip text-ellipsis">
              <button type="button" onClick={() => copy(params.data.filWalletAddress)}>
                <CopyIcon className="cursor-pointer text-slate-600 hover:text-slate-500" />
              </button>{" "}
              <Link
                to={`/address/${params.data.filWalletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {params.data.filWalletAddress}
              </Link>
            </div>
          )}
        </>
      );
    },
  },
];
