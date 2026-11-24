import { asJson } from "utils/proxy/api-helpers";
import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    // autobrr answers 200 with the release only when it is newer than the running version, else 204.
    update: {
      endpoint: "updates/latest",
      map: (data) => {
        const release = asJson(data);
        return { available: Boolean(release?.tag_name), version: release?.tag_name };
      },
    },
    stats: {
      endpoint: "release/stats",
      validate: ["push_approved_count", "push_rejected_count"],
    },
    filters: {
      endpoint: "filters",
    },
    indexers: {
      endpoint: "release/indexers",
    },
  },
};

export default widget;
