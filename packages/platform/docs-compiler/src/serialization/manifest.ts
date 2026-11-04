/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { z } from "zod";
import { SerializedPathSchema } from "./path.js";


/** Repository identity and artifact inventory stored in an archive's manifest.json. */
export interface SerializedManifest {
    /** Archive schema version, independent of package and document versions. */
    readonly formatVersion: 1;
    /** Repository properties preserved independently of its source location. */
    readonly repository: {
        /** Stable repository identifier. */
        readonly id: string;
        /** Human-readable repository name. */
        readonly name: string;
        /** JSON metadata whose interpretation belongs to the repository consumer. */
        readonly metadata: unknown;
    };
    /** Logical paths mapped to UUIDv7 keys locating artifacts/<key>.json records. */
    readonly artifacts: Readonly<Record<string, string>>;
}

/** Validates the version-1 manifest envelope, JSON metadata, logical paths, and UUIDv7 keys. */
export const SerializedManifestSchema = z.strictObject({
    formatVersion: z.literal(1),
    repository: z.strictObject({
        id: z.string().min(1),
        name: z.string(),
        metadata: z.json(),
    }),
    artifacts: z.record(SerializedPathSchema, z.uuidv7()),
}) satisfies z.ZodType<SerializedManifest>;
