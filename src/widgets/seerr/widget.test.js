import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("seerr widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("maps status to an update", () => {
    const { map } = widget.mappings.update;
    const body = (data) => Buffer.from(JSON.stringify({ version: "3.5.2", ...data }));
    expect(map(body({ updateAvailable: true, commitsBehind: 0 }))).toEqual({ available: true, version: undefined });
    expect(map(body({ updateAvailable: true, commitsBehind: 4 }))).toEqual({ available: true, version: "4 commits" });
    expect(map(body({ updateAvailable: false, commitsBehind: 0 }))).toEqual({ available: false, version: undefined });
  });
});
