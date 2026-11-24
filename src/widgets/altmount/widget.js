import altmountProxyHandler from "./proxy";

import { asJson } from "utils/proxy/api-helpers";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: altmountProxyHandler,

  mappings: {
    update: {
      endpoint: "system/update/status",
      map: (data) => {
        const { update_available: available, latest_version: version } = asJson(data);
        return { available: Boolean(available), version: version || undefined };
      },
    },
  },
};

export default widget;
