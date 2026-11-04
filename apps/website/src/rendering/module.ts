/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { z } from "zod";
import type * as Rendering from "./server";


/** Checks the trusted application renderer loaded by Vite or from the SSG bundle. */
export const renderingModuleSchema = z.custom<typeof Rendering>(
    value =>
        typeof value === "object" &&
        value !== null &&
        "render" in value &&
        typeof value.render === "function" &&
        "htmlDocument" in value &&
        typeof value.htmlDocument === "function" &&
        "escapeHtml" in value &&
        typeof value.escapeHtml === "function",
);
