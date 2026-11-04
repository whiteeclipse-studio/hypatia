/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Root } from "hast";

import * as z from "zod";
import { isHastRoot } from "./hast.ts";


/** One revision of a document or translation. */
export interface DocumentRevision {
    /** Sequential revision number. */
    readonly revision: number;
    /** Revision date in YYYY-MM-DD format. */
    readonly date: string;
    /** Formatted revision author. */
    readonly author: Root;
    /** Formatted revision description. */
    readonly description: Root;
}

/** Validates a structured revision entry and its formatted HAST fields. */
export const documentRevisionSchema = z.looseObject({
    revision: z.number().int().positive(),
    date: z.iso.date(),
    author: z.custom<Root>(isHastRoot, "Expected a valid HAST root."),
    description: z.custom<Root>(isHastRoot, "Expected a valid HAST root."),
});
