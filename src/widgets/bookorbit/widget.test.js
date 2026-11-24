import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("bookorbit widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("maps app-info to an update", () => {
    const { map } = widget.mappings.update;
    expect(map({ version: "v3.9.0", updateAvailable: true, latestVersion: "v3.10.0" })).toEqual({
      available: true,
      version: "v3.10.0",
    });
    expect(map({ version: "v3.9.0", updateAvailable: null, latestVersion: null })).toEqual({
      available: false,
      version: undefined,
    });
  });
});
