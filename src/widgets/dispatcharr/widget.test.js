import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("dispatcharr widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("maps a version_update notification to an update", () => {
    const { map } = widget.mappings.update;
    const body = (notifications) => Buffer.from(JSON.stringify({ notifications, count: notifications.length }));
    expect(map(body([{ notification_type: "version_update", action_data: { version: "0.34.1" } }]))).toEqual({
      available: true,
      version: "0.34.1",
    });
    expect(map(body([{ notification_type: "announcement" }]))).toEqual({ available: false, version: undefined });
  });
});
