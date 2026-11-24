import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";
import withWidgetFields from "utils/widget-fields";

const DEFAULT_FIELDS = ["queue", "speed", "healthy", "corrupted"];

export default function Component({ service: configuredService }) {
  const { t } = useTranslation();
  const service = withWidgetFields(configuredService, DEFAULT_FIELDS);
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget);

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="altmount.queue" />
        <Block label="altmount.speed" />
        <Block label="altmount.failed" />
        <Block label="altmount.healthy" />
        <Block label="altmount.pending" />
        <Block label="altmount.degraded" />
        <Block label="altmount.corrupted" />
        <Block label="altmount.repairing" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="altmount.queue" value={t("common.number", { value: data.queue })} />
      <Block label="altmount.speed" value={t("common.byterate", { value: data.speed })} />
      <Block label="altmount.failed" value={t("common.number", { value: data.failed })} />
      <Block label="altmount.healthy" value={t("common.number", { value: data.healthy })} />
      <Block label="altmount.pending" value={t("common.number", { value: data.pending })} />
      <Block label="altmount.degraded" value={t("common.number", { value: data.degraded })} />
      <Block label="altmount.corrupted" value={t("common.number", { value: data.corrupted })} />
      <Block label="altmount.repairing" value={t("common.number", { value: data.repairing })} />
    </Container>
  );
}
