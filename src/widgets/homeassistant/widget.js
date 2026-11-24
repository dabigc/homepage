import homeassistantProxyHandler from "./proxy";

import { asJson } from "utils/proxy/api-helpers";

const widget = {
  proxyHandler: homeassistantProxyHandler,

  mappings: {
    // Home Assistant `update.*` entities that are on (an update is available and not skipped).
    update: {
      endpoint: "update",
      map: (data) => {
        const pending = asJson(data);
        const version = pending.length === 1 ? `${pending[0].name} ${pending[0].version}` : `${pending.length} updates`;
        return { available: pending.length > 0, version };
      },
    },
  },
};

export default widget;
