import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("unifi widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("maps devices with newer firmware to an update count", () => {
    const { map } = widget.mappings.update;
    const body = (data) => Buffer.from(JSON.stringify({ meta: { rc: "ok" }, data }));
    expect(map(body([{ upgradable: true }, { upgradable: false }, {}]))).toEqual({
      available: true,
      version: "1 devices",
    });
    expect(map(body([{ upgradable: false }]))).toEqual({ available: false, version: "0 devices" });
  });
});
