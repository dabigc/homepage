import bookorbitProxyHandler from "./proxy";

import { asJson } from "utils/proxy/api-helpers";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: bookorbitProxyHandler,

  mappings: {
    update: {
      endpoint: "app-info",
      map: (data) => {
        const { updateAvailable, latestVersion } = asJson(data);
        return { available: Boolean(updateAvailable), version: latestVersion ?? undefined };
      },
    },
  },
};

export default widget;
