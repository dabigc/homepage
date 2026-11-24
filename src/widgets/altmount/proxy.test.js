import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, cache, logger } = vi.hoisted(() => {
  const store = new Map();

  return {
    httpProxy: vi.fn(),
    getServiceWidget: vi.fn(),
    cache: {
      get: vi.fn((k) => store.get(k)),
      put: vi.fn((k, v) => store.set(k, v)),
      del: vi.fn((k) => store.delete(k)),
      _reset: () => store.clear(),
    },
    logger: {
      debug: vi.fn(),
      error: vi.fn(),
    },
  };
});

vi.mock("utils/logger", () => ({ default: () => logger }));
vi.mock("utils/config/service-helpers", () => ({ default: getServiceWidget }));
vi.mock("utils/proxy/http", () => ({ httpProxy }));
vi.mock("memory-cache", () => ({ default: cache, ...cache }));
vi.mock("widgets/widgets", () => ({
  default: { altmount: { api: "{url}/api/{endpoint}" } },
}));

import altmountProxyHandler from "./proxy";

const widget = { type: "altmount", url: "http://altmount", username: "u", password: "p" };
const req = { query: { group: "g", service: "svc", index: "0" } };

const json = (body, status = 200) => [status, "application/json", Buffer.from(JSON.stringify(body))];
const loginOk = (token) => [
  200,
  "application/json",
  Buffer.from("{}"),
  { "set-cookie": [`JWT=${token}; Path=/; HttpOnly; SameSite=Lax`] },
];
const stats = {
  success: true,
  data: {
    queue: { total_queued: 2, total_processing: 1, total_failed: 4 },
    health: { healthy: 100, pending: 5, checking: 3, degraded: 2, corrupted: 1, repair_triggered: 6 },
  },
};
const metrics = { success: true, data: { download_speed_bytes_per_sec: 2048 } };
const expected = {
  queue: 3,
  failed: 4,
  speed: 2048,
  healthy: 100,
  pending: 8,
  degraded: 2,
  corrupted: 1,
  repairing: 6,
};

describe("widgets/altmount/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("logs in and sends the JWT cookie value as the X-JWT header", async () => {
    getServiceWidget.mockResolvedValue(widget);
    httpProxy
      .mockResolvedValueOnce(loginOk("token1"))
      .mockResolvedValueOnce(json(stats))
      .mockResolvedValueOnce(json(metrics));
    const res = createMockRes();

    await altmountProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(3);
    expect(httpProxy.mock.calls[0][0].toString()).toBe("http://altmount/api/auth/login");
    expect(JSON.parse(httpProxy.mock.calls[0][1].body)).toEqual({ username: "u", password: "p" });
    expect(httpProxy.mock.calls[1][0].toString()).toBe("http://altmount/api/system/stats");
    expect(httpProxy.mock.calls[1][1].headers["X-JWT"]).toBe("token1");
    expect(httpProxy.mock.calls[2][0].toString()).toBe("http://altmount/api/system/pool/metrics");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expected);
  });

  it("skips login when no credentials are configured", async () => {
    getServiceWidget.mockResolvedValue({ type: "altmount", url: "http://altmount" });
    httpProxy.mockResolvedValueOnce(json(stats)).mockResolvedValueOnce(json(metrics));
    const res = createMockRes();

    await altmountProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(2);
    expect(httpProxy.mock.calls[0][1]).toEqual({ method: "GET", headers: { accept: "application/json" } });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expected);
  });

  it("reuses the cached token", async () => {
    getServiceWidget.mockResolvedValue(widget);
    httpProxy
      .mockResolvedValueOnce(loginOk("token1"))
      .mockResolvedValueOnce(json(stats))
      .mockResolvedValueOnce(json(metrics))
      .mockResolvedValueOnce(json(stats))
      .mockResolvedValueOnce(json(metrics));

    await altmountProxyHandler(req, createMockRes());
    await altmountProxyHandler(req, createMockRes());

    const loginCalls = httpProxy.mock.calls.filter(([url]) => url.toString().includes("auth/login"));
    expect(loginCalls).toHaveLength(1);
  });

  it("logs in again when the token is rejected", async () => {
    getServiceWidget.mockResolvedValue(widget);
    httpProxy
      .mockResolvedValueOnce(loginOk("token1"))
      .mockResolvedValueOnce(json({}, 401))
      .mockResolvedValueOnce(loginOk("token2"))
      .mockResolvedValueOnce(json(stats))
      .mockResolvedValueOnce(json(metrics));
    const res = createMockRes();

    await altmountProxyHandler(req, res);

    expect(httpProxy.mock.calls[2][0].toString()).toBe("http://altmount/api/auth/login");
    expect(httpProxy.mock.calls[3][1].headers["X-JWT"]).toBe("token2");
    expect(res.statusCode).toBe(200);
  });

  it("returns an error when login fails", async () => {
    getServiceWidget.mockResolvedValue(widget);
    httpProxy.mockResolvedValueOnce(json({ success: false }, 401));
    const res = createMockRes();

    await altmountProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(401);
  });

  it("returns an error when login does not set a JWT cookie", async () => {
    getServiceWidget.mockResolvedValue(widget);
    httpProxy.mockResolvedValueOnce(json({ success: true }));
    const res = createMockRes();

    await altmountProxyHandler(req, res);

    expect(res.statusCode).toBe(401);
  });
});
