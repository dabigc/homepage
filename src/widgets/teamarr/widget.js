import { asJson } from "utils/proxy/api-helpers";
import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    // Teamarr caches its GitHub release check; this GET does not force a fresh one.
    update: {
      endpoint: "updates/check",
      map: (data) => {
        const { update_available: available, latest_version: version } = asJson(data);
        return { available: Boolean(available), version: version ?? undefined };
      },
    },
    homepage: {
      endpoint: "stats/homepage",
    },
    groups: {
      endpoint: "groups",
    },
    runs: {
      endpoint: "stats/runs?limit=1",
    },
  },
};

export default widget;
