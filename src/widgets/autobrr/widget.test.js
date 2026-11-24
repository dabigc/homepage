import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("autobrr widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("maps the latest newer release to an update", () => {
    const { map } = widget.mappings.update;
    expect(map(Buffer.from(JSON.stringify({ tag_name: "v1.91.1", body: "notes" })))).toEqual({
      available: true,
      version: "v1.91.1",
    });
  });
});
