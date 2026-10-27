/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { i18n, PostProcessorModule } from "i18next";

/** Preserves the caller's full requested key, including an explicit namespace, when resources are missing. */
export const requestedKeyProcessor: PostProcessorModule = {
    type: "postProcessor",
    name: "whiteeclipse-requested-key",
    /**
     * Keeps i18next translations and explicit defaults, restoring the original key on a miss.
     *
     * @param value - Translation produced by i18next.
     * @param keys - Requested key or fallback-key list.
     * @param options - Lookup options.
     * @param translator - i18next translator used for the lookup.
     * @returns The translation, explicit default, or last requested key.
     */
    process(value, keys, options, translator: i18n): string {
        if (options.defaultValue !== undefined || translator.exists(keys, options)) {
            return value;
        }
        return typeof keys === "string" ? keys : (keys[keys.length - 1] ?? value);
    },
};
