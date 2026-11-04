/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { compile, type CompilerPlugin, type WatchResult } from "@whiteeclipse/docs-compiler";
import { archiveReader } from "@whiteeclipse/docs-compiler/packages/archive-reader";
import type { PublicProject } from "../../../app/configuration";
import type { CacheAdapter } from "@whiteeclipse/cache";
import type { PreparedProject } from "../domain/types";
import { prepareProject } from "../../../rendering/prepare-project";
import { type ArchiveRecord, writeRecord } from "../storage/archives";


/**
 * One compiler invocation owns all subsequent archive generations for this worker.
 */
export interface ArchiveSession extends AsyncDisposable {
    replace(storage: CacheAdapter, blob: Blob, record: ArchiveRecord): Promise<void>;
    needsRestart(): boolean;
}

/**
 * Connects supplied archive bytes to compiler source invalidation.
 *
 * @rejects If a replacement archive cannot be compiled or persisted.
 *
 * @param project The project value.
 * @param publish The publish value.
 * @returns The prepared result.
 * @throws {Error} If the supplied input or current state is invalid.
 */
export function createArchiveSession(project: PublicProject, publish: (data: PreparedProject) => void): ArchiveSession {
    let session: WatchResult | undefined;
    let attempted = false;
    let changed: (() => void) | undefined;
    let candidate: { storage: CacheAdapter; blob: Blob; record: ArchiveRecord } | undefined;
    let prepared: PreparedProject | undefined;
    let pending: { resolve(): void; reject(error: unknown): void } | undefined;
    const source = new URL(project.archiveUrl ?? "").href;
    const publication: CompilerPlugin = {
        name: "website-publication",
        async buildEnd(repositories) {
            const repository = repositories[0];
            if (repositories.length !== 1 || repository === undefined || candidate === undefined) {
                throw new Error("Invalid archive update state.");
            }
            const data = await prepareProject(repository, project, crypto.randomUUID());
            await candidate.storage.write(candidate.record.archiveKey, candidate.blob);
            await writeRecord(candidate.storage, source, candidate.record);
            prepared = data;
        },
    };
    /**
     * Delivers owned page data without retaining invalidatable snapshot handles.
     *
     * @param watch The watch value.
     * @returns The prepared result.
     * @rejects If loading, validation or resource cleanup fails.
     */
    async function consume(watch: WatchResult): Promise<void> {
        void (async () => {
            for await (const error of watch.errors) {
                pending?.reject(error);
                pending = undefined;
            }
        })();
        for await (const snapshot of watch) {
            if (snapshot.size > 0 && prepared !== undefined) {
                publish(prepared);
                pending?.resolve();
                pending = undefined;
            }
        }
    }
    /**
     * Starts the single watch compilation using stable source callbacks.
     *
     * @returns The prepared result.
     * @rejects If loading, validation or resource cleanup fails.
     * @throws {Error} If the supplied input or current state is invalid.
     */
    async function initialize(): Promise<void> {
        if (attempted) {
            throw new Error("Restart this worker after initial compilation failure.");
        }
        attempted = true;
        session = await compile({
            repositories: source,
            watch: true,
            cache: { databaseName: `website-compiler-${crypto.randomUUID()}` },
            plugins: [
                archiveReader({
                    openSource() {
                        if (candidate === undefined) {
                            throw new Error("No archive bytes supplied.");
                        }
                        return candidate.blob.stream();
                    },
                    subscribe(_source, notify) {
                        changed = notify;
                        return () => {
                            changed = undefined;
                        };
                    },
                }),
                publication,
            ],
        });
        void consume(session);
    }
    return {
        async replace(storage, blob, record) {
            candidate = { storage, blob, record };
            const result = new Promise<void>((resolve, reject) => {
                pending = { resolve, reject };
            });
            if (session === undefined) {
                try {
                    await initialize();
                } catch (error) {
                    pending?.reject(error);
                    pending = undefined;
                }
            } else {
                changed?.();
            }
            await result;
        },
        needsRestart: () => attempted && session === undefined,
        async [Symbol.asyncDispose]() {
            await session?.[Symbol.asyncDispose]();
        },
    };
}
