// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

// Shaped after NowPlayingSession in tofa's public OpenAPI spec (GET /api/v1/system/activity/now-playing)
function session(overrides) {
  return {
    session_id: "s1",
    user_id: "u1",
    username: "alice",
    profile_name: null,
    media_file_id: "f1",
    media_title: "Movie",
    year: 2020,
    play_method: "DirectPlay",
    decision_mode: "DirectFile",
    transcode_reasons: [],
    transcode_reason_codes: [],
    output_video_codec: "h264",
    output_audio_codec: "aac",
    duration_ms: 2 * 60 * 60 * 1000,
    progress_pct: 25,
    is_paused: false,
    rebuffer_count: 0,
    created_at: "2026-11-24T10:00:00Z",
    last_access: "2026-11-24T10:30:00Z",
    ...overrides,
  };
}

function nowPlaying(sessions) {
  return { sessions, live_sessions: [], downloads: [], download_rate_bps: 0 };
}

describe("widgets/tofa/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests the now-playing endpoint and renders placeholder rows while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "tofa" } }} />, { settings: { hideErrors: false } });

    expect(useWidgetAPI.mock.calls[0][1]).toBe("nowplaying");
    expect(screen.getAllByText("-")).toHaveLength(2);
  });

  it("renders the no-active message when nothing is playing", () => {
    useWidgetAPI.mockReturnValue({ data: nowPlaying([]), error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "tofa" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("tofa.no_active")).toBeInTheDocument();
  });

  it("renders an error when the API call fails", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "Forbidden" } });

    renderWithProviders(<Component service={{ widget: { type: "tofa" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
  });

  it("expands a single stream to two rows with position and duration", () => {
    useWidgetAPI.mockReturnValue({ data: nowPlaying([session()]), error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "tofa" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("Movie")).toBeInTheDocument();
    // 25% of 2h => 30m
    expect(screen.getByText(/^30:00/)).toBeInTheDocument();
    expect(screen.getByText(/02:00:00/)).toBeInTheDocument();
  });

  it("renders one row per stream, sorted by position, with the user when enabled", () => {
    useWidgetAPI.mockReturnValue({
      data: nowPlaying([
        session({ session_id: "a", media_title: "Later", progress_pct: 50 }),
        session({
          session_id: "b",
          media_title: "Show - S01E02 - Pilot",
          profile_name: "Kids",
          progress_pct: 10,
          is_paused: true,
          play_method: "Transcode",
          decision_mode: "HlsFullTranscode",
        }),
      ]),
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "tofa", enableUser: true } }} />, {
      settings: { hideErrors: false },
    });

    const titles = screen.getAllByTitle(/\(/).map((el) => el.textContent);
    expect(titles).toEqual(["Show - S01E02 - Pilot (Kids)", "Later (alice)"]);
    expect(screen.getByText("12:00")).toBeInTheDocument();
    expect(screen.getByText("01:00:00")).toBeInTheDocument();
  });

  it("does not expand a single stream when expandOneStreamToTwoRows is false", () => {
    useWidgetAPI.mockReturnValue({ data: nowPlaying([session()]), error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "tofa", expandOneStreamToTwoRows: false } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("30:00")).toBeInTheDocument();
    expect(screen.queryByText(/02:00:00/)).not.toBeInTheDocument();
  });
});
