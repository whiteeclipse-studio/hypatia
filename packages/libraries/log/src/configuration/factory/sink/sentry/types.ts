/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Sink } from "@logtape/logtape";
import type { LogSinkFactory } from "../../types";


/** Factory used to configure the {@link Sink} that writes to Sentry. */
export type LogSentrySinkFactory = LogSinkFactory<"sentry", Sink | (Sink & Disposable)>;
