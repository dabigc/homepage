import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("technitium widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("maps checkForUpdate to an update", () => {
    const { map } = widget.mappings.update;
    const body = (response) => Buffer.from(JSON.stringify({ status: "ok", response }));
    expect(map(body({ updateAvailable: true, updateVersion: "15.7", currentVersion: "15.6.2" }))).toEqual({
      available: true,
      version: "15.7",
    });
    expect(map(body({ updateAvailable: false, updateVersion: "15.6.2" }))).toEqual({
      available: false,
      version: "15.6.2",
    });
  });
});
