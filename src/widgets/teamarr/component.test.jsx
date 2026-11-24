// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

const responses = {
  homepage: { channels_total: 438, live_now: 12, games_today: 100 },
  groups: { groups: [], total: 84 },
  runs: { runs: [{ started_at: "2026-11-24T18:00:00+00:00", duration_ms: 741368 }], count: 1 },
};

function mockApi(overrides = {}) {
  useWidgetAPI.mockImplementation((_widget, endpoint) => {
    const value = { ...responses, ...overrides }[endpoint];
    return value instanceof Error ? { data: undefined, error: value } : { data: value, error: undefined };
  });
}

const render = (widget = {}) =>
  renderWithProviders(<Component service={{ widget: { type: "teamarr", ...widget } }} />, {
    settings: { hideErrors: false },
  });

describe("widgets/teamarr/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = render();

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("teamarr.channels")).toBeInTheDocument();
    expect(screen.getByText("teamarr.runDuration")).toBeInTheDocument();
  });

  it("renders error UI when any endpoint errors", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) =>
      endpoint === "groups" ? { data: undefined, error: { message: "nope" } } : { data: responses[endpoint] },
    );

    render();

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
  });

  it("renders the default fields", () => {
    mockApi();

    const { container } = render();

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "teamarr.channels", 438);
    expectBlockValue(container, "teamarr.groups", 84);
    expectBlockValue(container, "teamarr.runDuration", 741);
    expect(screen.getByText("teamarr.lastRun")).toBeInTheDocument();
  });

  it("renders configured fields", () => {
    mockApi();

    const { container } = render({ fields: ["liveNow", "gamesToday"] });

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expectBlockValue(container, "teamarr.liveNow", 12);
    expectBlockValue(container, "teamarr.gamesToday", 100);
  });

  it("falls back to dashes when there is no run history", () => {
    mockApi({ runs: { runs: [], count: 0 } });

    const { container } = render({ fields: ["lastRun", "runDuration"] });

    expectBlockValue(container, "teamarr.lastRun", "-");
    expectBlockValue(container, "teamarr.runDuration", "-");
  });
});
