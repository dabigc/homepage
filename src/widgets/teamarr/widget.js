import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
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
