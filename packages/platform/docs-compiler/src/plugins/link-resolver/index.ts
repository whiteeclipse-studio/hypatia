/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Root } from "hast";
import {
    type CompilerPlugin,
    type DocumentArtifact,
    isHastRoot,
    type TransformHookContext,
    type TranslationArtifact,
} from "../../types/index.js";
import { copyMetadata } from "../../compiler/snapshot/metadata.js";
import { createDestinationResolver, resolveTree } from "./destinations.js";


/**
 * Resolves local HAST links and includes targets after Markdown parsing, without awaiting them.
 *
 * @returns An exploratory link transform under draft RFC-0005.
 */
export function linkResolver(): CompilerPlugin {
    return {
        name: "link-resolver",
        async transform(value, reference) {
            if (!("read" in value) || (value.type !== "document" && value.type !== "translation")) {
                return undefined;
            }
            if (reference.type !== "artifact") {
                throw new TypeError("Link resolution requires an artifact source.");
            }
            return resolveArtifact(value, this);
        },
    };
}

/**
 * Produces immutable metadata and an independent cache payload containing rewritten article HAST.
 *
 * @param artifact Parsed document or translation.
 * @param context Importer-bound compiler services.
 * @returns Replacement artifact with queued link dependencies.
 * @rejects If reading, resolution, inclusion, or cache access fails.
 */
async function resolveArtifact(artifact: DocumentArtifact | TranslationArtifact, context: TransformHookContext) {
    context.signal.throwIfAborted();
    const tree = await artifact.read();
    const metadata = structuredClone(artifact.metadata);
    const resolve = createDestinationResolver(context);
    await resolveTree(tree, resolve);
    await resolveTree(metadata.copyrightAndLicence, resolve);
    for (const revision of metadata.revisions) {
        await resolveTree(revision.author, resolve);
        await resolveTree(revision.description, resolve);
    }
    context.signal.throwIfAborted();
    const key = crypto.randomUUID();
    await context.cache.write(key, new Blob([JSON.stringify(tree)], { type: "application/json" }));
    context.signal.throwIfAborted();
    const payload = Object.freeze({ key, decode: decodeTree });
    const cache = context.cache;
    /**
     * Reads independent article HAST without retaining targets or their content readers.
     *
     * @returns Rewritten article HAST.
     * @rejects If the fixed cache payload is unavailable or invalid.
     */
    const read = async () => {
        const contents = await cache.read(key);
        if (contents === undefined) {
            throw new Error(`Link resolver payload ${key} is unavailable.`);
        }
        return decodeTree(contents);
    };
    if (artifact.type === "translation") {
        return Object.freeze({
            ...artifact,
            metadata: copyMetadata({ ...artifact.metadata, ...metadata }),
            payload,
            read,
        });
    }
    return Object.freeze({ ...artifact, metadata: copyMetadata({ ...artifact.metadata, ...metadata }), payload, read });
}

/**
 * Decodes rewritten HAST without build-bound resources.
 *
 * @param contents Fixed cache payload.
 * @returns A fresh validated HAST root.
 * @rejects If stored JSON does not contain HAST.
 */
async function decodeTree(contents: Blob): Promise<Root> {
    const tree: unknown = JSON.parse(await contents.text());
    if (!isHastRoot(tree)) {
        throw new TypeError("Invalid cached link resolver HAST.");
    }
    return tree;
}
