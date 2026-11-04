/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { AnyArtifact, Repository } from "../../types/index.js";
import { assertActive, iterate, readArtifact, type SnapshotState } from "./lifetime.js";
import { copyMetadata } from "./metadata.js";


/**
 * Copies artifact metadata and creates a handle guarded by the snapshot lifetime.
 *
 * @param artifact Plugin artifact supplying content reads.
 * @param path Validated logical path from the repository inventory.
 * @param state Shared snapshot state.
 * @returns A frozen handle whose properties and reads reject invalidation.
 */
function captureArtifact(artifact: AnyArtifact, path: string, state: SnapshotState): AnyArtifact {
    switch (artifact.type) {
        case "unknown":
            return createArtifactHandle(artifact, path, state);
        case "asset":
            return createArtifactHandle(artifact, path, state);
        case "document":
            return createArtifactHandle(artifact, path, state);
        case "translation":
            return createArtifactHandle(artifact, path, state);
    }
}

/**
 * Preserves a concrete artifact's discriminator, metadata, and content types in its handle.
 *
 * @param artifact Plugin artifact with a receiver-bound content reader.
 * @param artifact.type Concrete artifact discriminator.
 * @param artifact.metadata Metadata associated with that discriminator.
 * @param artifact.read Reader returning the concrete content representation.
 * @param path Validated logical path from the repository inventory.
 * @param state Shared snapshot lifetime.
 * @returns A frozen handle preserving the source's correlated types.
 */
function createArtifactHandle<Type extends AnyArtifact["type"], Metadata, Contents>(
    artifact: { readonly type: Type; readonly metadata: Metadata; read(): Promise<Contents> },
    path: string,
    state: SnapshotState,
): { readonly path: string; readonly type: Type; readonly metadata: Metadata; read(this: void): Promise<Contents> } {
    const type = artifact.type;
    const metadata = copyMetadata(artifact.metadata);
    return Object.freeze({
        get path() {
            assertActive(state);
            return path;
        },
        get type() {
            assertActive(state);
            return type;
        },
        get metadata() {
            assertActive(state);
            return metadata;
        },
        async read() {
            return readArtifact(artifact, state);
        },
    });
}

/**
 * Captures a repository's fixed inventory and registers its lifetime-guarded handle.
 *
 * @param source Completed plugin repository.
 * @param state Shared snapshot state receiving the captured repository.
 * @throws {Error} If repository IDs or artifact paths conflict.
 */
export function captureRepository(source: Repository, state: SnapshotState): void {
    const { id, name } = source;
    if (state.inventory.has(id)) {
        throw new Error(`Duplicate repository ID ${id}.`);
    }
    const metadata = copyMetadata(source.metadata);
    const artifacts = new Map<string, AnyArtifact>();
    for (const [path, artifact] of source) {
        if (path !== artifact.path || artifacts.has(path)) {
            throw new Error(`Conflicting artifact path ${path} in repository ${id}.`);
        }
        artifacts.set(path, captureArtifact(artifact, path, state));
    }
    state.inventory.set(
        id,
        Object.freeze({
            get id() {
                assertActive(state);
                return id;
            },
            get name() {
                assertActive(state);
                return name;
            },
            get metadata() {
                assertActive(state);
                return metadata;
            },
            getArtifact(path: string) {
                assertActive(state);
                return artifacts.get(path);
            },
            [Symbol.iterator]() {
                assertActive(state);
                return iterate(artifacts.entries(), state);
            },
        }),
    );
}
