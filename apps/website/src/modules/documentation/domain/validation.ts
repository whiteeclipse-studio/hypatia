/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { z } from "zod";
import { documentRevisionSchema, isHastRoot } from "@whiteeclipse/docs-compiler";
import type { Root } from "hast";
import type { Bootstrap, PageData, ProjectIndex } from "./types";


const project = z.object({
    id: z.string().regex(/^[a-z0-9][a-z0-9_-]*$/),
    name: z.string(),
    archiveUrl: z.url().optional(),
    updateTtlMs: z.number().positive().optional(),
});
const entry = z.object({
    path: z.string(),
    route: z.string().startsWith("/"),
    id: z.string(),
    title: z.string(),
    navigable: z.boolean(),
    locale: z.string(),
    sourceId: z.string().optional(),
});
const tree = z.custom<Root>(isHastRoot);
const document = z.object({
    title: z.string(),
    tree,
    copyrightAndLicence: tree,
    revisions: z.array(documentRevisionSchema),
});
export const indexSchema: z.ZodType<ProjectIndex> = z.object({
    project,
    generation: z.string(),
    entries: z.array(entry),
    assets: z.record(z.string(), z.string()),
});
export const indexesSchema = z.array(indexSchema);
export const pageSchema: z.ZodType<PageData> = z.object({
    route: z.string(),
    title: z.string(),
    variants: z.record(z.string(), document),
    directory: z.boolean(),
});
export const bootstrapSchema: z.ZodType<Bootstrap> = z.object({
    module: z.enum(["landing", "documentation"]),
    locale: z.string(),
    indexes: indexesSchema,
    page: pageSchema.optional(),
    development: z.boolean(),
});
