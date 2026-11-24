import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("altmount widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("maps the update status to an update", () => {
    const { map } = widget.mappings.update;
    expect(map({ current_version: "v0.3.0", latest_version: "v0.4.0", update_available: true })).toEqual({
      available: true,
      version: "v0.4.0",
    });
    expect(map({ current_version: "v0.4.0", latest_version: "", update_available: false })).toEqual({
      available: false,
      version: undefined,
    });
  });
});
