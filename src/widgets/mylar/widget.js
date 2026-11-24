import { asJson } from "utils/proxy/api-helpers";
import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api?cmd={endpoint}&apikey={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    // Mylar compares the running commit with the latest one on its branch.
    update: {
      endpoint: "getVersion",
      map: (data) => {
        const { current_version: current, latest_version: latest, commits_behind: behind } = asJson(data).data ?? {};
        return {
          available: behind > 0 || Boolean(latest && current && latest !== current),
          version: latest?.slice(0, 7),
        };
      },
    },
    issues: {
      endpoint: "getIndex",
    },
    series: {
      endpoint: "seriesjsonListing",
    },
    wanted: {
      endpoint: "getWanted",
    },
  },
};

export default widget;
