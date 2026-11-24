import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("truenas widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("maps update.status to an update from websocket and REST responses", () => {
    const { map } = widget.mappings.update;
    const status = { code: "NORMAL", status: { current_version: {}, new_version: { version: "25.10.8" } } };
    expect(map(status)).toEqual({ available: true, version: "25.10.8" });
    expect(map(Buffer.from(JSON.stringify(status)))).toEqual({ available: true, version: "25.10.8" });
    expect(map({ code: "NORMAL", status: { current_version: {}, new_version: null } })).toEqual({
      available: false,
      version: undefined,
    });
  });
});
