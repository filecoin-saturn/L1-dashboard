import { CopyIcon, ProjectRoadmapIcon } from "@primer/octicons-react";
import bytes from "bytes";
import classNames from "classnames";
import copy from "copy-text-to-clipboard";
import { Link } from "react-router-dom";
import HTMLTooltip from "./HTMLTooltip";

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
  },
  {
    field: "id",
    headerName: "ID",
    valueFormatter: (params: any) => params.data.idShort,
    cellRenderer: (params: any) => {
      return (
        <>
          <button type="button" onClick={() => copy(params.data.id)}>
            <CopyIcon className="cursor-pointer text-slate-600 hover:text-slate-500" />
          </button>{" "}
          {params.valueFormatted} {params.data.sunrise ? <span>🌅️</span> : null}
          {params.context.state.authorizationToken && params.data.core ? <span>⭐️</span> : null}
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
      if (params.context.state.authorizationToken && params.data.core) {
        tooltip.push("⭐️ Core node");
      }
      return tooltip;
    },
  },
  {
    field: "level",
    headerName: "Type",
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
          {params.context.state.authorizationToken ? (
            <div className="overflow-clip text-ellipsis">
              <button type="button" onClick={() => copy(params.data.ipAddress)}>
                <CopyIcon className="cursor-pointer text-slate-600 hover:text-slate-500" />
              </button>{" "}
              {params.data.ipAddress}
            </div>
          ) : null}
          <div className="overflow-clip text-ellipsis">{params.data.ispShort}</div>
        </>
      );
    },
    tooltipValueGetter: ({ data }: any) => {
      return `Org: ${data.geoloc.org ?? "Unknown"}`;
    },
  },
  {
    field: "location",
    headerName: "Location",
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
    field: "diskStats.usedDisk",
    headerName: "Disk Usage",
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
      return `Loads: ${data.cpuStats.loadAvgs.join(", ")}`;
    },
  },
  {
    field: "ttfbStats.p95_1h",
    headerName: "TTFB",
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
    tooltipComponentParams: { className: "capitalize" },
    tooltipValueGetter: ({ data }: any) => {
      return asStrings(data.ttfbStats, (key: string) =>
        ["error", "reqs", "hits"].every((exclude) => !key.includes(exclude))
      );
    },
  },
  {
    field: "cacheRate1h",
    headerName: "Cache rate",
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
              {params.data.cacheRate1h > 0 ? asPercent(params.data.cacheRate1h) : "n/a"}
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
              {params.data.cacheRate24h > 0 ? asPercent(params.data.cacheRate24h) : "n/a"}
            </span>
          </div>
        </>
      );
    },
    tooltipComponent: HTMLTooltip,
    tooltipComponentParams: { className: "capitalize" },
    tooltipValueGetter: ({ data }: any) => {
      return asStrings(data.ttfbStats, (key: any) => ["reqs", "hits"].some((include) => key.includes(include)));
    },
  },
  {
    field: "errorRate1h",
    headerName: "Error rate",
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
              {params.data.errorRate1h > 0 ? asPercent(params.data.errorRate1h) : "n/a"}
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
              {params.data.errorRate24h > 0 ? asPercent(params.data.errorRate24h) : "n/a"}
            </span>
          </div>
        </>
      );
    },
    tooltipComponent: HTMLTooltip,
    tooltipComponentParams: { className: "capitalize" },
    tooltipValueGetter: ({ data }: any) => {
      return asStrings(data.ttfbStats, (key: string) => ["reqs", "error"].some((include) => key.includes(include)));
    },
  },
  {
    field: "nicStats.bytesSent",
    headerName: "Upload",
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
    field: "bias",
    headerName: "Weight",
    sortable: true,
    filter: "agNumberColumnFilter",
    floatingFilter: true,
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
    tooltipComponentParams: { className: "capitalize" },
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
    field: "operator",
    headerName: "Operator",
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
