import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    nowplaying: {
      endpoint: "system/activity/now-playing",
    },
  },
};

export default widget;
