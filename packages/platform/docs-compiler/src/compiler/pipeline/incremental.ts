/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import {
    type AnyArtifact,
    type ArtifactPayload,
    type ArtifactReference,
    type CompilationResult,
    isHastRoot,
    type Reference,
} from "../../types/index.js";
import { copyMetadata } from "../snapshot/index.js";
import { getReferenceKey } from "./reference.js";


/** A reusable result independent of build-owned handles and resources. */
export interface SourceRecord {
    /** Captured source identity and optional version used to produce this record. */
    readonly reference: Reference;
    /** Captured transformed output with content reads routed through the shared cache. */
    readonly value: CompilationResult;
    /** Source identities whose invalidation also invalidates this result. */
    readonly dependencies: ReadonlySet<string>;
    /** Subscription identities needed while this record remains in the retained inventory. */
    readonly watches: ReadonlySet<string>;
    /** Cached payload keys represented by the captured output. */
    readonly payloadKeys: ReadonlySet<string>;
    /** Queued targets that must remain included when this record is reused. */
    readonly included: readonly ArtifactReference[];
}

/** Incremental state supplied by the compiler to one pipeline invocation. */
export interface IncrementalBuild {
    /** Last successful inventory, preserved while this attempt constructs its replacement. */
    readonly previous: ReadonlyMap<string, SourceRecord>;
    /** Changed source identities and their transitive dependents, excluded from reuse. */
    readonly invalidated: Set<string>;
    /** New inventory collecting freshly processed and reused source records. */
    readonly records: Map<string, SourceRecord>;

    /**
     * Reads captured artefact content without relying on a previous build's resources.
     *
     * @param payload Cache key and decoder for the captured artefact.
     * @returns Independently owned decoded content.
     * @rejects If the payload is unavailable or reading, decoding, or cloning fails.
     */
    readPayload(this: void, payload: ArtifactPayload): Promise<unknown>;
}

/**
 * Creates scratch state; the previous successful records remain unchanged on failure.
 *
 * @param previous Last successful records.
 * @param changes Invalidated source identities.
 * @param readPayload Session-owned payload reader.
 * @returns State for a single build attempt.
 */
export function createIncrementalBuild(
    previous: ReadonlyMap<string, SourceRecord>,
    changes: readonly Reference[],
    readPayload: IncrementalBuild["readPayload"],
): IncrementalBuild {
    const invalidated = new Set(changes.map(getReferenceKey));
    const dependents = new Map<string, Set<string>>();
    for (const [key, record] of previous) {
        for (const dependency of record.dependencies) {
            const sources = dependents.get(dependency) ?? new Set<string>();
            sources.add(key);
            dependents.set(dependency, sources);
        }
    }
    for (const key of invalidated) {
        for (const dependent of dependents.get(key) ?? []) {
            invalidated.add(dependent);
        }
    }
    return { previous, invalidated, records: new Map(), readPayload };
}

/**
 * Retains a cached result and its reachable dependencies in the new inventory.
 *
 * @param record Result to retain.
 * @param build Current scratch state.
 * @param include Replays inclusions from each newly retained record.
 */
export function retainRecord(
    record: SourceRecord,
    build: IncrementalBuild,
    include: (reference: ArtifactReference) => void,
): void {
    const key = getReferenceKey(record.reference);
    if (build.records.has(key)) {
        return;
    }
    build.records.set(key, record);
    for (const reference of record.included) {
        include(reference);
    }
    for (const dependency of record.dependencies) {
        const child = build.previous.get(dependency);
        if (child !== undefined) {
            retainRecord(child, build, include);
        }
    }
}

/**
 * Captures plugin output as cache-backed values that survive build resource disposal.
 *
 * @param value Transformed output.
 * @param readPayload Session-owned reader.
 * @param keys Collects represented payload keys.
 * @returns An independent representation with fresh content access.
 * @throws {TypeError} If watch content lacks a payload descriptor.
 */
export function captureCompilationValue(
    value: CompilationResult,
    readPayload: IncrementalBuild["readPayload"],
    keys: Set<string>,
): CompilationResult {
    if ("read" in value) {
        return captureArtifact(value, readPayload, keys);
    }
    const artifacts = new Map<string, AnyArtifact>();
    for (const [path, artifact] of value) {
        if (path !== artifact.path || artifacts.has(path)) {
            throw new TypeError(`Conflicting artifact path ${path}.`);
        }
        artifacts.set(path, captureArtifact(artifact, readPayload, keys));
    }

    return Object.freeze({
        id: value.id,
        name: value.name,
        metadata: copyMetadata(value.metadata),
        getArtifact: (path: string) => artifacts.get(path),
        [Symbol.iterator]: () => artifacts.entries(),
    });
}

/**
 * Creates a reusable artifact without retaining the plugin's build-bound read closure.
 *
 * @param artifact Plugin artifact.
 * @param readPayload Session-owned reader.
 * @param keys Represented payload keys.
 * @returns Captured artifact data and content access.
 * @throws {TypeError} If a content-bearing artifact has no payload descriptor.
 */
function captureArtifact(
    artifact: AnyArtifact,
    readPayload: IncrementalBuild["readPayload"],
    keys: Set<string>,
): AnyArtifact {
    const { path, type } = artifact;
    if (artifact.payload === undefined) {
        if (type !== "unknown") {
            throw new TypeError(`Watch artifact ${path} must provide a cache payload descriptor.`);
        }
        const metadata = copyMetadata(artifact.metadata);
        return Object.freeze({
            path,
            type,
            metadata,
            async read() {
                await Promise.resolve();
                return undefined;
            },
        });
    }
    const payload: ArtifactPayload = Object.freeze({ key: artifact.payload.key, decode: artifact.payload.decode });
    keys.add(payload.key);
    switch (artifact.type) {
        case "unknown":
            return createPayloadArtifact(artifact, payload, async () =>
                readTypedPayload(payload, readPayload, value => value === undefined),
            );
        case "asset":
            return createPayloadArtifact(artifact, payload, async () =>
                readTypedPayload(payload, readPayload, value => value instanceof Blob),
            );
        case "document":
            return createPayloadArtifact(artifact, payload, async () =>
                readTypedPayload(payload, readPayload, isHastRoot),
            );
        case "translation":
            return createPayloadArtifact(artifact, payload, async () =>
                readTypedPayload(payload, readPayload, isHastRoot),
            );
    }
}

/**
 * Captures typed artifact data without retaining the plugin's resource-bound read closure.
 *
 * @param artifact Source data with its concrete discriminator and metadata type.
 * @param artifact.path Captured logical path.
 * @param artifact.type Concrete artifact discriminator.
 * @param artifact.metadata Metadata associated with that discriminator.
 * @param payload Independent cache key and decoder.
 * @param read Cache-backed reader returning the artifact's concrete content type.
 * @returns A frozen artifact preserving metadata and content type relationships.
 */
function createPayloadArtifact<Type extends AnyArtifact["type"], Metadata, Contents>(
    artifact: { readonly path: string; readonly type: Type; readonly metadata: Metadata },
    payload: ArtifactPayload,
    read: () => Promise<Contents>,
): {
    readonly path: string;
    readonly type: Type;
    readonly metadata: Metadata;
    readonly payload: ArtifactPayload;
    read(this: void): Promise<Contents>;
} {
    return Object.freeze({
        path: artifact.path,
        type: artifact.type,
        metadata: copyMetadata(artifact.metadata),
        payload,
        read,
    });
}

/**
 * Checks decoded cache contents before exposing them through a concrete artifact reader.
 *
 * @param payload Represented cache entry.
 * @param readPayload Shared compiler-owned reader.
 * @param validate Predicate for the artifact's promised content representation.
 * @returns Decoded contents matching the artifact's read contract.
 * @rejects If reading fails or the decoder returns contents of the wrong type.
 */
async function readTypedPayload<Contents>(
    payload: ArtifactPayload,
    readPayload: IncrementalBuild["readPayload"],
    validate: (value: unknown) => value is Contents,
): Promise<Contents> {
    const contents = await readPayload(payload);
    if (!validate(contents)) {
        throw new TypeError(`Unexpected contents for artifact payload ${payload.key}.`);
    }
    return contents;
}
