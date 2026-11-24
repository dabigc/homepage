import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";
import withWidgetFields from "utils/widget-fields";

const DEFAULT_FIELDS = ["channels", "groups", "lastRun", "runDuration"];

export default function Component({ service: configuredService }) {
  const { t } = useTranslation();
  const service = withWidgetFields(configuredService, DEFAULT_FIELDS);
  const { widget } = service;

  const { data: homepageData, error: homepageError } = useWidgetAPI(widget, "homepage");
  const { data: groupsData, error: groupsError } = useWidgetAPI(widget, "groups");
  const { data: runsData, error: runsError } = useWidgetAPI(widget, "runs");

  const error = homepageError || groupsError || runsError;
  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!homepageData || !groupsData || !runsData) {
    return (
      <Container service={service}>
        <Block label="teamarr.channels" />
        <Block label="teamarr.groups" />
        <Block label="teamarr.lastRun" />
        <Block label="teamarr.runDuration" />
        <Block label="teamarr.liveNow" />
        <Block label="teamarr.gamesToday" />
      </Container>
    );
  }

  const lastRun = runsData.runs?.[0];
  const lastRunAt = lastRun?.started_at ? new Date(lastRun.started_at).getTime() : null;
  const durationMs = lastRun?.duration_ms;

  return (
    <Container service={service}>
      <Block label="teamarr.channels" value={t("common.number", { value: homepageData.channels_total ?? 0 })} />
      <Block label="teamarr.groups" value={t("common.number", { value: groupsData.total ?? 0 })} />
      <Block label="teamarr.lastRun" value={lastRunAt ? t("common.relativeDate", { value: lastRunAt }) : "-"} />
      <Block
        label="teamarr.runDuration"
        value={typeof durationMs === "number" ? t("common.duration", { value: Math.round(durationMs / 1000) }) : "-"}
      />
      <Block label="teamarr.liveNow" value={t("common.number", { value: homepageData.live_now ?? 0 })} />
      <Block label="teamarr.gamesToday" value={t("common.number", { value: homepageData.games_today ?? 0 })} />
    </Container>
  );
}
