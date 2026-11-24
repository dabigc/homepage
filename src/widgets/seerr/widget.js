import { asJson } from "utils/proxy/api-helpers";
import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    update: {
      endpoint: "status",
      map: (data) => {
        const { updateAvailable, commitsBehind } = asJson(data);
        return {
          available: Boolean(updateAvailable),
          version: commitsBehind > 0 ? `${commitsBehind} commits` : undefined,
        };
      },
    },
    "request/count": {
      endpoint: "request/count",
      validate: ["pending", "approved", "available"],
    },
    "issue/count": {
      endpoint: "issue/count",
      validate: ["open", "total"],
    },
  },
};

export default widget;
