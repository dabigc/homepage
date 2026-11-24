import arrUpdateMap from "utils/arr-update";
import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/v1/{endpoint}?apikey={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    update: {
      endpoint: "update",
      map: arrUpdateMap,
    },
    indexer: {
      endpoint: "indexer",
    },
    indexerstats: {
      endpoint: "indexerstats",
    },
  },
};

export default widget;
