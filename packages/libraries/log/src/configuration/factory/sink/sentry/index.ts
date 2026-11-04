/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { getSentrySink, type SentryNamespace } from "@logtape/sentry";

import type { LogSentrySinkFactory } from "./types.js";
import type { LogLevel } from "@logtape/logtape";


export type * from "./types.js";

/**
 * Builds a {@link LogSentrySinkFactory}.
 *
 * @param sentry The Sentry namespace of the current application.
 * @param lowestBreadcrumbsLevel The lowest log level for breadcrumbs.
 * @param lowestLogLevel The lowest log level for logs.
 * @returns The generated {@link LogSentrySinkFactory} object.
 */
export function makeLogSentrySinkFactory(
    sentry: SentryNamespace,
    lowestBreadcrumbsLevel: LogLevel = "trace",
    lowestLogLevel: LogLevel = "info",
): LogSentrySinkFactory {
    return {
        name: "sentry",
        build() {
            return getSentrySink({
                sentry,
                breadcrumbs: { level: lowestBreadcrumbsLevel, maxLevel: lowestLogLevel },
                logs: { level: lowestLogLevel },
            });
        },
    };
}
