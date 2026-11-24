import { describe, expect, it } from "vitest";

import arrUpdateMap from "./arr-update";

// The proxy handler hands mappings the raw response body.
const body = (releases) => Buffer.from(JSON.stringify(releases));

describe("utils/arr-update", () => {
  it("reports an update when the latest release is not installed", () => {
    const data = [
      { version: "3.1.0.5799", installed: false, latest: true },
      { version: "2.6.5.5623", installed: true, latest: false },
    ];
    expect(arrUpdateMap(body(data))).toEqual({ available: true, version: "3.1.0.5799" });
  });

  it("reports no update when the latest release is installed", () => {
    const data = [{ version: "3.1.6.5079", installed: true, latest: true }];
    expect(arrUpdateMap(body(data))).toEqual({ available: false, version: "3.1.6.5079" });
  });

  it("reports no update for an empty release list", () => {
    expect(arrUpdateMap(body([]))).toEqual({ available: false, version: undefined });
  });
});
