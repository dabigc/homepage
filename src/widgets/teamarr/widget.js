import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    dashboard: {
      endpoint: "stats/dashboard",
    },
    runs: {
      endpoint: "stats/runs",
    },
    history: {
      endpoint: "stats/history?days=1",
    },
  },
};

export default widget;
