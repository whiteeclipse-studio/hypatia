/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { makeDefaultLogConfigurationBuilder } from "./configuration/index.js";
import { isLogLevel, type LogLevel } from "@logtape/logtape";


const environment = typeof process === "undefined" ? undefined : process.env;
const production = environment?.NODE_ENV?.toLowerCase() === "production";

// Configure the default log level.
let lowestLevel: LogLevel = "debug";
if (production) {
    lowestLevel = "info";
}

// Read the LOG_LEVEL environment variable.
const configuredLevel = environment?.["LOG_LEVEL"];
if (typeof configuredLevel !== "undefined" && isLogLevel(configuredLevel)) {
    lowestLevel = configuredLevel;
}

const logging = await makeDefaultLogConfigurationBuilder({ lowestLevel, production }).apply();

export default logging;
