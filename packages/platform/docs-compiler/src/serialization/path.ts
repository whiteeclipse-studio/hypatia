/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { z } from "zod";
import { LogicalPathSchema } from "../paths";


/** Validates stored logical paths without rewriting archive keys or artifact paths. */
export const SerializedPathSchema = z.string().refine(path => {
    const parsed = LogicalPathSchema.safeParse(path);
    return parsed.success && parsed.data === path;
}, "Expected an already-normalized logical path.");
