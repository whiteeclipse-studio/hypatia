/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Sink } from "@logtape/logtape";
import type { LogSinkFactory } from "../../types";
import type { WithJsonLinesFormatterOptionMutators } from "./options.js";


/**
 * Factory used to configure the {@link Sink} that writes JSON to the console.
 *
 * Internally, this uses {@link import("@logtape/logtape").getJsonLinesFormatter} to format the messages.
 */
export interface LogJSONSinkFactory
    extends
        LogSinkFactory<"json", Sink | (Sink & Disposable)>,
        WithJsonLinesFormatterOptionMutators<LogJSONSinkFactory> {}
