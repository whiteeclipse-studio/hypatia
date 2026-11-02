/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { makeDefaultLogConfigurationBuilder } from "./configuration";
import { isLogLevel, type LogLevel } from "@logtape/logtape";


const production = import.meta.env.NODE_ENV?.toLowerCase() === "production";

// Configure the default log level.
let lowestLevel: LogLevel = "trace";
if (production) {
    lowestLevel = "info";
}

// Read the LOG_EVENT_LEVEL environment variable.
const configuredLevel = import.meta.env["LOG_LEVEL"];
if (typeof configuredLevel !== "undefined" && isLogLevel(configuredLevel)) {
    lowestLevel = configuredLevel;
}

const logging = await makeDefaultLogConfigurationBuilder({ lowestLevel, production }).apply();

export default logging;
