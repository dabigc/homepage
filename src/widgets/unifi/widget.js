import unifiProxyHandler from "./proxy";

import { asJson } from "utils/proxy/api-helpers";

const widget = {
  api: "{url}{prefix}/api/{endpoint}",
  proxyHandler: unifiProxyHandler,

  mappings: {
    // Devices the controller says have newer firmware. Assumes the default site.
    update: {
      endpoint: "s/default/stat/device",
      map: (data) => {
        const count = asJson(data).data?.filter((device) => device.upgradable).length ?? 0;
        return { available: count > 0, version: `${count} devices` };
      },
    },
    "stat/sites": {
      endpoint: "stat/sites",
    },
  },
};

export default widget;
