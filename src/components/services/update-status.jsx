import { useTranslation } from "next-i18next/pages";
import useSWR from "swr";

// Widget types whose widget.js has an `update` mapping returning { available, version }.
export const updateCheckTypes = [
  "autobrr",
  "bookorbit",
  "channelsdvrserver",
  "dispatcharr",
  "homeassistant",
  "jellyseerr",
  "lidarr",
  "mylar",
  "overseerr",
  "prowlarr",
  "proxmoxbackupserver",
  "radarr",
  "seerr",
  "sonarr",
  "technitium",
  "truenas",
  "unifi",
];

export default function UpdateStatus({ groupName, serviceName, index }) {
  const { t } = useTranslation();
  const params = new URLSearchParams({ group: groupName, service: serviceName, index, endpoint: "update" });
  const { data } = useSWR(`/api/services/proxy?${params.toString()}`, {
    refreshInterval: 3600000,
    shouldRetryOnError: false,
  });

  if (!data?.available) return null;

  return (
    <div
      className="w-auto text-center rounded-b-[3px] overflow-hidden update-status bg-theme-500/10 dark:bg-theme-900/50 px-1.5 py-0.5"
      title={data.version ? `${t("updateStatus.available")}: ${data.version}` : t("updateStatus.available")}
    >
      <div className="font-bold uppercase text-[8px] text-amber-500/80">{t("updateStatus.update")}</div>
    </div>
  );
}
