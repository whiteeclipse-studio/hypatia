/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { expect, it, vi } from "vitest";
import type { SentryNamespace } from "@logtape/sentry";
import { makeLogSentrySinkFactory } from "./index";


it("uses the supplied namespace for breadcrumbs, structured logs, and exceptions", () => {
    const breadcrumb = vi.fn<NonNullable<ReturnType<SentryNamespace["getIsolationScope"]>>["addBreadcrumb"]>();
    const info = vi.fn<NonNullable<NonNullable<SentryNamespace["logger"]>["info"]>>();
    const exception = vi.fn<SentryNamespace["captureException"]>(() => "event-id");
    const namespace: SentryNamespace = {
        captureMessage: vi.fn(() => "event-id"),
        captureException: exception,
        getActiveSpan: () => undefined,
        getClient() {
            return {
                getOptions() {
                    return { enableLogs: true };
                },
            };
        },
        getIsolationScope() {
            return { addBreadcrumb: breadcrumb };
        },
        logger: { info },
    };
    const factory = makeLogSentrySinkFactory(namespace);
    expect(factory.name).toBe("sentry");
    const sink = factory.build();
    // This concrete factory builds synchronously; the generic interface permits promises.
    expect(sink).not.toBeInstanceOf(Promise);
    if (typeof sink !== "function") {
        throw new TypeError("Expected a synchronous Sentry sink");
    }
    const record = {
        category: ["hypatia", "test"],
        timestamp: 0,
        message: ["message"],
        rawMessage: "message",
        properties: {},
    };
    sink({ ...record, level: "debug" });
    expect(breadcrumb).toHaveBeenCalledOnce();
    expect(info).not.toHaveBeenCalled();
    sink({ ...record, level: "info" });
    expect(info).toHaveBeenCalledOnce();
    const error = new Error("synthetic failure");
    sink({ ...record, level: "error", properties: { error } });
    expect(exception).toHaveBeenCalledWith(error, expect.anything());
});

it("honors explicit breadcrumb and structured log thresholds", () => {
    const breadcrumb = vi.fn<NonNullable<ReturnType<SentryNamespace["getIsolationScope"]>>["addBreadcrumb"]>();
    const info = vi.fn<NonNullable<NonNullable<SentryNamespace["logger"]>["info"]>>();
    const namespace: SentryNamespace = {
        captureMessage: () => "event-id",
        captureException: () => "event-id",
        getActiveSpan: () => undefined,
        getClient() {
            return {
                getOptions() {
                    return { enableLogs: true };
                },
            };
        },
        getIsolationScope() {
            return { addBreadcrumb: breadcrumb };
        },
        logger: { info },
    };
    const sink = makeLogSentrySinkFactory(namespace, "warning", "error").build();
    if (typeof sink !== "function") {
        throw new TypeError("Expected a synchronous Sentry sink");
    }
    sink({
        category: ["test"],
        timestamp: 0,
        message: ["below threshold"],
        rawMessage: "below threshold",
        properties: {},
        level: "info",
    });
    expect(info).not.toHaveBeenCalled();
    expect(breadcrumb).not.toHaveBeenCalled();
});
