import dispatcharrProxyHandler from "./proxy";

import { asJson } from "utils/proxy/api-helpers";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: dispatcharrProxyHandler,

  mappings: {
    // Dispatcharr raises an admin notification when a newer release is out.
    update: {
      endpoint: "api/core/notifications/",
      map: (data) => {
        const notice = asJson(data).notifications?.find((n) => n.notification_type === "version_update");
        return { available: Boolean(notice), version: notice?.action_data?.version };
      },
    },
    token: {
      endpoint: "api/accounts/token/",
    },
    channels: {
      endpoint: "api/channels/channels/",
    },
    streams: {
      endpoint: "proxy/ts/status",
    },
  },
};

export default widget;
