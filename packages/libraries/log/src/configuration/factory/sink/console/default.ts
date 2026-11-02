/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { PrettyFormatterOptions } from "@logtape/pretty";


/** Default options used for the LogTape pretty formatter. */
export const DEFAULT_PRETTY_FORMATTER_OPTIONS: PrettyFormatterOptions = {
    colors: true,
    align: true,
    wordWrap: false,
    level: "full",
    timeZone: null,
    timestamp: "rfc3339",
    timestampColor: "black",
    timestampStyle: "dim",
    levelColors: {
        trace: "cyan",
        debug: "magenta",
        info: "blue",
        warning: "yellow",
        error: "red",
        fatal: "red",
    },
    levelStyle: "bold",
    icons: false,
    categorySeparator: ":",
    categoryColor: "black",
    categoryColorMap: new Map([[["hypatia"], "cyan"]]),
    categoryStyle: "underline",
    categoryWidth: 20,
    categoryTruncate: false,
    messageColor: "black",
    messageStyle: "reset",
};
