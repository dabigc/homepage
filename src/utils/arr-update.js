import { asJson } from "utils/proxy/api-helpers";

// Sonarr, Radarr, Lidarr and Prowlarr share the same `/update` response: a list of
// releases, where one is flagged `latest` and each says whether it is `installed`.
export default function arrUpdateMap(data) {
  const latest = asJson(data).find((release) => release.latest);
  return { available: Boolean(latest && !latest.installed), version: latest?.version };
}
