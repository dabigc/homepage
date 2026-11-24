import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "altmountProxyHandler";
const tokenCacheKey = `${proxyName}__token`;
const logger = createLogger(proxyName);

function jwtFromHeaders(headers) {
  const setCookie = headers?.["set-cookie"];
  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  const jwtCookie = cookies.find((cookie) => cookie?.startsWith("JWT="));
  return jwtCookie?.split(";")[0].slice("JWT=".length) || null;
}

async function login(widget, service) {
  const url = new URL(formatApiCall(widgets[widget.type].api, { ...widget, endpoint: "auth/login" }));
  const [status, , , responseHeaders] = await httpProxy(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({ username: widget.username, password: widget.password }),
  });

  if (status !== 200) {
    logger.debug("AltMount login failed for service '%s' with status %d", service, status);
    return null;
  }

  // AltMount returns the JWT only as a cookie. Sending it back in the X-JWT header
  // works regardless of the cookie domain AltMount is configured with.
  const token = jwtFromHeaders(responseHeaders);
  if (!token) {
    logger.error("AltMount login for service '%s' did not return a JWT cookie", service);
    return null;
  }

  // expired tokens are replaced when a request gets a 401
  cache.put(`${tokenCacheKey}.${service}`, token);
  return token;
}

async function apiCall(widget, endpoint, service) {
  const url = new URL(formatApiCall(widgets[widget.type].api, { ...widget, endpoint }));
  const useLogin = widget.username && widget.password;
  const request = (token) =>
    httpProxy(url, {
      method: "GET",
      headers: token ? { accept: "application/json", "X-JWT": token } : { accept: "application/json" },
    });

  let token;
  if (useLogin) {
    token = cache.get(`${tokenCacheKey}.${service}`) ?? (await login(widget, service));
    if (!token) return { status: 401, data: null };
  }

  let [status, , data] = await request(token);

  if (status === 401 && useLogin) {
    logger.debug("AltMount API rejected the token, logging in again");
    cache.del(`${tokenCacheKey}.${service}`);
    token = await login(widget, service);
    if (!token) return { status, data: null };
    [status, , data] = await request(token);
  }

  if (status !== 200) {
    logger.error("Error getting data from AltMount: %s status %d. Data: %s", url, status, data);
    return { status, data: null };
  }

  try {
    return { status, data: JSON.parse(data.toString()).data };
  } catch (e) {
    logger.error("Error parsing AltMount response: %s", e);
  }

  return { status: 500, data: null };
}

export default async function altmountProxyHandler(req, res, map) {
  const { group, service, endpoint, index } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);

  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  if (endpoint === "system/update/status") {
    let update = await apiCall(widget, endpoint, service);
    // A dev build never matches a release tag, so compare it with the latest commit instead.
    if (update.data?.current_version?.startsWith("dev")) {
      update = await apiCall(widget, `${endpoint}?channel=dev`, service);
    }
    if (!update.data) {
      return res.status(update.status).json({ error: "Error fetching AltMount update status" });
    }
    return res.status(200).json(map ? map(update.data) : update.data);
  }

  const stats = await apiCall(widget, "system/stats", service);
  if (!stats.data) {
    return res.status(stats.status).json({ error: "Error fetching AltMount stats" });
  }

  const metrics = await apiCall(widget, "system/pool/metrics", service);
  if (!metrics.data) {
    return res.status(metrics.status).json({ error: "Error fetching AltMount pool metrics" });
  }

  const { queue = {}, health = {} } = stats.data;

  return res.status(200).json({
    queue: (queue.total_queued ?? 0) + (queue.total_processing ?? 0),
    failed: queue.total_failed ?? 0,
    speed: metrics.data.download_speed_bytes_per_sec ?? 0,
    healthy: health.healthy ?? 0,
    pending: (health.pending ?? 0) + (health.checking ?? 0),
    degraded: health.degraded ?? 0,
    corrupted: health.corrupted ?? 0,
    repairing: health.repair_triggered ?? 0,
  });
}
