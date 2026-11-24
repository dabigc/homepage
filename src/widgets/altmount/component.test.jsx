// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

const data = { queue: 3, failed: 4, speed: 2048, healthy: 100, pending: 8, degraded: 2, corrupted: 1, repairing: 6 };

describe("widgets/altmount/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders default placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "altmount" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("altmount.queue")).toBeInTheDocument();
    expect(screen.getByText("altmount.speed")).toBeInTheDocument();
    expect(screen.getByText("altmount.healthy")).toBeInTheDocument();
    expect(screen.getByText("altmount.corrupted")).toBeInTheDocument();
  });

  it("renders error UI when the endpoint errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "altmount" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
  });

  it("renders the default fields", () => {
    useWidgetAPI.mockReturnValue({ data, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "altmount" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "altmount.queue", 3);
    expectBlockValue(container, "altmount.speed", 2048);
    expectBlockValue(container, "altmount.healthy", 100);
    expectBlockValue(container, "altmount.corrupted", 1);
  });

  it("renders configured fields", () => {
    useWidgetAPI.mockReturnValue({ data, error: undefined });

    const service = { widget: { type: "altmount", fields: ["pending", "degraded", "repairing", "failed"] } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "altmount.pending", 8);
    expectBlockValue(container, "altmount.degraded", 2);
    expectBlockValue(container, "altmount.repairing", 6);
    expectBlockValue(container, "altmount.failed", 4);
  });
});
