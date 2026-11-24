import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("homeassistant widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("maps pending update entities to an update", () => {
    const { map } = widget.mappings.update;
    const body = (list) => Buffer.from(JSON.stringify(list));
    expect(map(body([{ name: "Home Assistant Core Update", version: "2026.11.3" }]))).toEqual({
      available: true,
      version: "Home Assistant Core Update 2026.11.3",
    });
    expect(
      map(
        body([
          { name: "a", version: "1" },
          { name: "b", version: "2" },
        ]),
      ),
    ).toEqual({
      available: true,
      version: "2 updates",
    });
    expect(map(body([]))).toEqual({ available: false, version: "0 updates" });
  });
});
