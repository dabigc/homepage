import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: dashboardData, error: dashboardError } = useWidgetAPI(widget, "dashboard");
  const { data: runsData, error: runsError } = useWidgetAPI(widget, "runs");
  const { data: historyData, error: historyError } = useWidgetAPI(widget, "history");

  if (dashboardError || runsError || historyError) {
    return <Container service={service} error={dashboardError || runsError || historyError} />;
  }

  if (!dashboardData || !runsData || !historyData) {
    return (
      <Container service={service}>
        <Block label="teamarr.channels" />
        <Block label="teamarr.groups" />
        <Block label="teamarr.lastRun" />
        <Block label="teamarr.runDuration" />
      </Container>
    );
  }

  const activeChannels = dashboardData?.channels?.active || 0;
  const channelGroupsCount = dashboardData?.channels?.group_breakdown?.length || 0;

  const startedAt = runsData?.runs?.[0]?.started_at
    ? new Date(runsData.runs[0].started_at).toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "N/A";

  const durationSeconds = historyData?.[0]?.avg_duration_ms
    ? (historyData[0].avg_duration_ms / 1000).toFixed(2)
    : 0;

  return (
    <Container service={service}>
      <Block label="teamarr.channels" value={t("common.number", { value: activeChannels })} />
      <Block label="teamarr.groups" value={t("common.number", { value: channelGroupsCount })} />
      <Block label="teamarr.lastRun" value={startedAt} />
      <Block label="teamarr.runDuration" value={`${durationSeconds}s`} />
    </Container>
  );
}
