/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Sink } from "@logtape/logtape";
import type { LogSinkFactory } from "../../types.js";
import type { WithPrettyFormatterOptionMutators } from "./options.js";


/**
 * Factory used to configure the {@link Sink} that writes to the console.
 *
 * Internally, this uses {@link import("@logtape/pretty").getPrettyFormatter} to format the messages.
 */
export interface LogConsoleSinkFactory
    extends
        LogSinkFactory<"console", Sink | (Sink & Disposable)>,
        WithPrettyFormatterOptionMutators<LogConsoleSinkFactory> {}
