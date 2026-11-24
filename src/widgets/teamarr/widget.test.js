import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("teamarr widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("maps endpoints that exist on current Teamarr releases", () => {
    expect(widget.mappings.homepage.endpoint).toBe("stats/homepage");
    expect(widget.mappings.groups.endpoint).toBe("groups");
    expect(widget.mappings.runs.endpoint).toBe("stats/runs?limit=1");
  });

  it("maps updates/check to an update", () => {
    const { map } = widget.mappings.update;
    const body = (data) => Buffer.from(JSON.stringify({ current_version: "2.19.0", ...data }));
    expect(map(body({ update_available: true, latest_version: "2.27.0" }))).toEqual({
      available: true,
      version: "2.27.0",
    });
    expect(map(body({ update_available: false, latest_version: "2.19.0" }))).toEqual({
      available: false,
      version: "2.19.0",
    });
  });
});
