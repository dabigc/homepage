import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("mylar widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("maps getVersion to an update when the latest commit differs", () => {
    const { map } = widget.mappings.update;
    const body = (data) => Buffer.from(JSON.stringify({ success: true, data }));
    expect(map(body({ current_version: "aaaaaaa111", latest_version: "bbbbbbb222", commits_behind: 3 }))).toEqual({
      available: true,
      version: "bbbbbbb",
    });
    expect(map(body({ current_version: "aaaaaaa111", latest_version: "aaaaaaa111", commits_behind: null }))).toEqual({
      available: false,
      version: "aaaaaaa",
    });
  });
});
