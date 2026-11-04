/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { z } from "zod";
import defaults from "../../website.config";
import type { WebsiteConfiguration } from "../app/configuration";


const sourceSchema = z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("local"), path: z.string().min(1) }),
    z.object({ kind: z.literal("archive"), url: z.string().min(1) }),
]);
const schema = z.object({
    projects: z.array(
        z.object({
            id: z.string().min(1),
            name: z.string().min(1),
            source: sourceSchema,
            buildSource: sourceSchema.optional(),
            archiveUrl: z.string().optional(),
            updateTtlMs: z.number().positive().optional(),
        }),
    ),
    documentationOrigin: z.url(),
    landingOrigin: z.url(),
});
const customPath = process.env["WEBSITE_CONFIG"];
const root = fileURLToPath(new URL("../..", import.meta.url));
const loaded: unknown =
    customPath === undefined ? { default: defaults } : await import(pathToFileURL(resolve(root, customPath)).href);

export const configuration: WebsiteConfiguration = z.object({ default: schema }).parse(loaded).default;
