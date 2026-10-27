/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { i18n, PostProcessorModule } from "i18next";

/** Preserves the requested key on a miss, including an explicit namespace and regardless of supplied defaults. */
export const preserveRequestKey: PostProcessorModule = {
    type: "postProcessor",
    name: "whiteeclipse-requested-key",
    /**
     * Keeps found translations and restores the original requested key when lookup fails.
     *
     * @param value - i18next's translated or default text.
     * @param keys - The requested key or ordered fallback keys.
     * @param options - Lookup options such as namespace, count, and interpolation values.
     * @param translator - The translator that performed this lookup.
     * @returns Found text or the last requested key, without stripping its namespace.
     */
    process(value, keys, options, translator: i18n): string {
        if (translator.exists(keys, options)) {
            return value;
        }

        return typeof keys === "string" ? keys : (keys[keys.length - 1] ?? value);
    },
};
