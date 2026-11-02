/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { expect, it } from "vitest";
import { makeLogConfigurationBuilder } from "@whiteeclipse/log";
import { makeLogConsoleSinkFactory } from "@whiteeclipse/log/sink/console";
import { makeLogJSONSinkFactory } from "@whiteeclipse/log/sink/json";
import { makeLogSentrySinkFactory } from "@whiteeclipse/log/sink/sentry";


it("resolves each public sink entrypoint", () => {
    expect(makeLogConfigurationBuilder).toBeTypeOf("function");
    expect(makeLogConsoleSinkFactory().name).toBe("console");
    expect(makeLogJSONSinkFactory().name).toBe("json");
    expect(makeLogSentrySinkFactory).toBeTypeOf("function");
});
