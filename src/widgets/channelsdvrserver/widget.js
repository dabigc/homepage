import { asJson } from "utils/proxy/api-helpers";
import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    // Channels DVR updates itself; this reports an update that is downloading or waiting for a restart.
    update: {
      endpoint: "updater",
      map: (data) => {
        const { LatestVersion, Downloading, RestartNeeded } = asJson(data);
        return { available: Boolean(Downloading || RestartNeeded), version: LatestVersion || undefined };
      },
    },
    status: {
      endpoint: "dvr",
    },
  },
};

export default widget;
