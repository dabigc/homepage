import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("channelsdvrserver widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("maps the updater state to an update", () => {
    const { map } = widget.mappings.update;
    const body = (data) =>
      Buffer.from(JSON.stringify({ LatestVersion: "", Downloading: false, RestartNeeded: false, ...data }));
    expect(map(body({}))).toEqual({ available: false, version: undefined });
    expect(map(body({ LatestVersion: "2026.11.20", RestartNeeded: true }))).toEqual({
      available: true,
      version: "2026.11.20",
    });
  });
});
