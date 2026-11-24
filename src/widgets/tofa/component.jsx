import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";
import { BsCpu, BsFillCpuFill, BsFillPlayFill, BsPauseFill } from "react-icons/bs";
import { MdOutlineSmartDisplay, MdSmartDisplay } from "react-icons/md";

import useWidgetAPI from "utils/proxy/use-widget-api";

const rowClassName =
  "text-theme-700 dark:text-theme-200 relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1 flex";

function millisecondsToString(milliseconds) {
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const parts = hours > 0 ? [hours, minutes, seconds] : [minutes, seconds];
  return parts.map((part) => part.toString().padStart(2, "0")).join(":");
}

// tofa reports progress as a 0-100 percentage of duration_ms
function positionMs(session) {
  return ((session.duration_ms ?? 0) * (session.progress_pct ?? 0)) / 100;
}

function streamTitle(session, enableUser) {
  const title = session.media_title ?? "";
  const user = session.profile_name || session.username;
  return enableUser && user ? `${title} (${user})` : title;
}

function DeliveryIcon({ session }) {
  if (session.play_method === "DirectPlay") return <MdSmartDisplay className="opacity-50" />;
  if (session.play_method === "DirectStream") return <MdOutlineSmartDisplay className="opacity-50" />;
  if (session.decision_mode === "HlsCopyVideoTranscodeAudio") return <BsCpu className="opacity-50" />;
  return <BsFillCpuFill className="opacity-50" />;
}

function PlayState({ session }) {
  const Icon = session.is_paused ? BsPauseFill : BsFillPlayFill;
  return (
    <div className="text-xs z-10 self-center ml-1">
      <Icon className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80" />
    </div>
  );
}

function ProgressBar({ session }) {
  return (
    <div
      className="absolute h-5 rounded-md bg-theme-200 dark:bg-theme-900/40 z-0"
      style={{ width: `${Math.min(100, Math.max(0, session.progress_pct ?? 0))}%` }}
    />
  );
}

function Title({ title }) {
  return (
    <div className="text-xs z-10 self-center ml-2 relative w-full h-4 grow mr-2">
      <div className="absolute w-full whitespace-nowrap text-ellipsis overflow-hidden" title={title}>
        {title}
      </div>
    </div>
  );
}

function SingleSessionEntry({ session, enableUser }) {
  return (
    <>
      <div className={rowClassName}>
        <Title title={streamTitle(session, enableUser)} />
        <div className="self-center text-xs flex justify-end mr-1.5 pl-1">
          <DeliveryIcon session={session} />
        </div>
      </div>
      <div className={rowClassName}>
        <ProgressBar session={session} />
        <PlayState session={session} />
        <div className="grow " />
        <div className="self-center text-xs flex justify-end mr-2 z-10">
          {millisecondsToString(positionMs(session))}
          <span className="mx-0.5 text-[8px]">/</span>
          {millisecondsToString(session.duration_ms ?? 0)}
        </div>
      </div>
    </>
  );
}

function SessionEntry({ session, enableUser }) {
  return (
    <div className={rowClassName}>
      <ProgressBar session={session} />
      <PlayState session={session} />
      <Title title={streamTitle(session, enableUser)} />
      <div className="self-center text-xs flex justify-end mr-1.5 pl-1 z-10">
        <DeliveryIcon session={session} />
      </div>
      <div className="self-center text-xs flex justify-end mr-2 z-10">{millisecondsToString(positionMs(session))}</div>
    </div>
  );
}

function MessageRows({ message, twoRows }) {
  return (
    <div className="flex flex-col pb-1 mx-1">
      <div className={`${rowClassName} text-xs`}>
        <span className="absolute left-2 text-xs mt-[2px]">{message}</span>
      </div>
      {twoRows && (
        <div className={`${rowClassName} text-xs`}>
          <span className="absolute left-2 text-xs mt-[2px]">-</span>
        </div>
      )}
    </div>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget, "nowplaying", { refreshInterval: 5000 });

  const enableUser = !!widget?.enableUser; // default is false
  const expandOneStreamToTwoRows = widget?.expandOneStreamToTwoRows !== false; // default is true

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return <MessageRows message="-" twoRows={expandOneStreamToTwoRows} />;
  }

  const playing = [...(data.sessions ?? [])].sort((a, b) => positionMs(a) - positionMs(b));

  if (playing.length === 0) {
    return <MessageRows message={t("tofa.no_active")} twoRows={expandOneStreamToTwoRows} />;
  }

  if (expandOneStreamToTwoRows && playing.length === 1) {
    return (
      <div className="flex flex-col pb-1 mx-1">
        <SingleSessionEntry session={playing[0]} enableUser={enableUser} />
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-1 mx-1">
      {playing.map((session) => (
        <SessionEntry key={session.session_id} session={session} enableUser={enableUser} />
      ))}
    </div>
  );
}
