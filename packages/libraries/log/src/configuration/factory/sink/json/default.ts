/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { JsonLinesFormatterOptions } from "@logtape/logtape";


/** Default options used for the LogTape JSON formatter. */
export const DEFAULT_JSON_FORMATTER_OPTIONS: JsonLinesFormatterOptions = {
    properties: "flatten",
    categorySeparator: ":",
    message: "template",
};
