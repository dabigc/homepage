import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("proxmoxbackupserver widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("requires failed task query params for the tasks endpoint, with since optional", () => {
    expect(widget.mappings["nodes/localhost/tasks"].params).toEqual(["errors", "limit"]);
    expect(widget.mappings["nodes/localhost/tasks"].optionalParams).toEqual(["since"]);
  });

  it("maps pending apt updates to an update count", () => {
    const { map } = widget.mappings.update;
    const body = (data) => Buffer.from(JSON.stringify({ data }));
    expect(map(body([{ Package: "a" }, { Package: "b" }]))).toEqual({ available: true, version: "2 packages" });
    expect(map(body([]))).toEqual({ available: false, version: "0 packages" });
  });
});
