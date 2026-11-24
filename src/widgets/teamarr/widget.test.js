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
});
