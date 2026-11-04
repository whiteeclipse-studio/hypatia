/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { randomUUID } from "node:crypto";
import { openAsBlob } from "node:fs";
import { mkdtempDisposable, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { CacheAdapter } from "../types.ts";
import { createCacheOperationQueue } from "../operations.ts";
import { getLogger } from "@whiteeclipse/log";


const logger = getLogger(["whiteeclipse", "cache", "filesystem"]);

/** Temporary filesystem cache with borrowed, file-backed Blobs. */
export interface FileSystemCacheAdapter extends CacheAdapter {
    /** Absolute path to the directory deleted on disposal. */
    readonly directory: string;
}

/**
 * Creates a temporary filesystem cache.
 *
 * Operations run sequentially. Disposal drains them and deletes the directory.
 *
 * @param location Existing parent directory; defaults to the system temporary directory.
 * @returns A cache owning a new temporary directory.
 * @rejects If directory creation fails.
 */
export async function createFileSystemCacheAdapter(location = tmpdir()): Promise<FileSystemCacheAdapter> {
    const directory = await mkdtempDisposable(join(location, "whiteeclipse-cache-")).catch((error: unknown) => {
        logger.error("Failed to create filesystem cache directory.", { error });
        throw error;
    });
    logger.debug("Created temporary filesystem cache.");
    const entries = new Map<string, { path: string; type: string }>();
    const queue = createCacheOperationQueue("filesystem", async () => {
        entries.clear();
        await directory[Symbol.asyncDispose]();
    });

    return {
        directory: directory.path,
        async read(key) {
            return queue.run("read", key, async () => {
                const entry = entries.get(key);
                if (entry === undefined) {
                    return undefined;
                }
                try {
                    return await openAsBlob(entry.path, { type: entry.type });
                } catch (error) {
                    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
                        logger.warn("Cached file disappeared; treating the read as a miss.");
                        return undefined;
                    }
                    throw error;
                }
            });
        },
        async write(key, contents) {
            return queue.run("write", key, async () => {
                const path = join(directory.path, randomUUID());
                try {
                    await writeFile(path, contents.stream(), { flag: "wx" });
                    const previous = entries.get(key);
                    if (previous !== undefined) {
                        await rm(previous.path, { force: true });
                    }
                    entries.set(key, { path, type: contents.type });
                } catch (error) {
                    try {
                        await rm(path, { force: true });
                    } catch (cleanupError) {
                        throw new AggregateError([error, cleanupError], "Failed to write and clean up a cache entry.", {
                            cause: cleanupError,
                        });
                    }
                    throw error;
                }
            });
        },
        async remove(key) {
            return queue.run("remove", key, async () => {
                const entry = entries.get(key);
                if (entry !== undefined) {
                    await rm(entry.path, { force: true });
                    entries.delete(key);
                }
            });
        },
        async [Symbol.asyncDispose]() {
            await queue[Symbol.asyncDispose]();
        },
    };
}
