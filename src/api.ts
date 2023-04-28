import { RequestInit, MetricsResponse, FetchAllResponse } from "./api.types";

// on localhost (dev env) we need to set the metrics origin to local /metrics endpoint
// so that we proxy those calls through vite local server to get around cors on aws
// endpoints being are allowed only on specific domains (see proxy in vite.config.ts)
const METRICS_ORIGIN = import.meta.env.DEV
  ? window.location.origin + "/metrics"
  : import.meta.env.VITE_METRICS_ORIGIN ?? "https://ln3tnkd4d5uiufjgimi6jlkmci0bceff.lambda-url.us-west-2.on.aws/";

/**
 * Fetch API wrapper that throws on 400+ http status.
 */
export async function wfetch(resource: RequestInfo | URL, opts: RequestInit = {}, dataObj: object = {}) {
  if (Number.isFinite(opts.timeout)) {
    const controller = new AbortController();
    opts.signal = controller.signal;
    setTimeout(() => controller.abort(), opts.timeout);
  }

  const response = await fetch(resource, opts);

  if (response.status >= 400) {
    let message = await response
      .json()
      .then((d) => d.message)
      .catch(() => null);
    message = `${message ?? (response.statusText || response.status)}`;

    throw new Error(message);
  }
  return response;
}

export async function fetchMetrics(
  filAddress: string,
  startDate: Date,
  endDate: Date,
  step: string,
  signal: AbortSignal
) {
  const url = new URL(METRICS_ORIGIN);

  // This is only used for local testing.
  const dataObj = {
    event: {
      queryStringParameters: {
        filAddress,
        startDate: startDate.getTime(),
        endDate: endDate.getTime(),
        step,
      },
    },
  };

  url.searchParams.set("filAddress", filAddress);
  url.searchParams.set("startDate", `${startDate.getTime()}`);
  url.searchParams.set("endDate", `${endDate.getTime()}`);
  url.searchParams.set("step", step);

  const res: FetchAllResponse = await wfetch(url, { signal }, dataObj).then((r) => r.json());

  res.earnings.forEach((e) => {
    e.timestamp = new Date(e.timestamp);
  });
  res.metrics.forEach((m) => {
    m.timeStamp = new Date(m.timeStamp);
  });

  return res;
}

export async function fetchNodeMetrics(
  nodeId: string,
  startDate: Date,
  endDate: Date,
  step: string,
  signal: AbortSignal
) {
  const url = new URL(METRICS_ORIGIN);

  // This is only used for local testing.
  const dataObj = {
    event: {
      queryStringParameters: {
        nodeId,
        startDate: startDate.getTime(),
        endDate: endDate.getTime(),
        step,
      },
    },
  };

  url.searchParams.set("nodeId", nodeId);
  url.searchParams.set("startDate", `${startDate.getTime()}`);
  url.searchParams.set("endDate", `${endDate.getTime()}`);
  url.searchParams.set("step", step);

  const res: MetricsResponse = await wfetch(url, { signal }, dataObj).then((r) => r.json());

  res.earnings.forEach((e) => {
    e.timestamp = new Date(e.timestamp);
  });
  res.metrics.forEach((m) => {
    m.timeStamp = new Date(m.timeStamp);
  });

  return res;
}
