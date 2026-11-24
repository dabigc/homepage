import { asJson } from "utils/proxy/api-helpers";
import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api2/json/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    // Pending apt package updates, as last fetched by PBS itself (this GET does not refresh them).
    update: {
      endpoint: "nodes/localhost/apt/update",
      map: (data) => {
        const count = asJson(data).data?.length ?? 0;
        return { available: count > 0, version: `${count} packages` };
      },
    },
    "status/datastore-usage": {
      endpoint: "status/datastore-usage",
    },
    "nodes/localhost/tasks": {
      endpoint: "nodes/localhost/tasks",
      params: ["errors", "limit"],
      optionalParams: ["since"],
    },
    "nodes/localhost/status": {
      endpoint: "nodes/localhost/status",
    },
  },
};

export default widget;
