/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { type DBSchema, deleteDB, openDB } from "idb";
import type { CacheAdapter } from "../types.js";
import { createCacheOperationQueue } from "../operations.js";
import { getLogger } from "@whiteeclipse/log";


const logger = getLogger(["whiteeclipse", "cache", "indexeddb"]);

/** IndexedDB cleanup options. */
export interface IndexedDbCacheAdapterOptions {
    /** Delete the entire database on disposal; defaults to false. */
    readonly deleteOnDispose?: boolean;
}

/** Blob cache backed by a dedicated IndexedDB database. */
export interface IndexedDbCacheAdapter extends CacheAdapter {
    /** Dedicated database name. */
    readonly name: string;
}

/** Version-one cache schema. */
interface CacheDatabase extends DBSchema {
    entries: {
        key: string;
        value: Blob;
    };
}

/**
 * Opens an IndexedDB cache.
 *
 * Writes resolve after transaction commit.
 *
 * Disposal closes the connection and retains entries unless deleteOnDispose is set.
 * Deletion rejects on failure or blockage.
 *
 * External version changes close the connection; later operations reject.
 * Other connections and browser storage eviction are outside the queue.
 *
 * @param name Database reserved for this adapter's schema.
 * @param options Cleanup options.
 * @returns The IndexedDB cache.
 * @rejects If IndexedDB is unavailable, opening fails, or the schema is incompatible.
 */
export async function createIndexedDbCacheAdapter(
    name: string,
    options: IndexedDbCacheAdapterOptions = {},
): Promise<IndexedDbCacheAdapter> {
    if (typeof indexedDB === "undefined") {
        const error = new Error("IndexedDB is unavailable in this environment.");
        logger.error("Cannot open IndexedDB cache.", { error });
        throw error;
    }

    const deleteOnDispose = options.deleteOnDispose ?? false;
    const database = await openDB<CacheDatabase>(name, 1, {
        /**
         * Creates the cache store on first open.
         *
         * @param db Database to initialize.
         */
        upgrade(db) {
            db.createObjectStore("entries");
        },

        /** Closes the connection for an external schema change. */
        blocking() {
            logger.warn("Closing IndexedDB cache connection for an external version change.");
            database.close();
        },
    }).catch((error: unknown) => {
        logger.error("Failed to open IndexedDB cache.", { error });
        throw error;
    });

    if (!database.objectStoreNames.contains("entries")) {
        database.close();
        const error = new Error("The IndexedDB database does not contain the cache entries store.");
        logger.error("Incompatible IndexedDB cache schema.", { error });
        throw error;
    }

    logger.debug("Opened IndexedDB cache connection.");
    const queue = createCacheOperationQueue("indexeddb", async () => {
        database.close();
        if (deleteOnDispose) {
            await deleteDB(name);
        }
    });

    return {
        name,
        async read(key) {
            return queue.run("read", key, async () => {
                const value: unknown = await database.get("entries", key);
                if (value === undefined) {
                    return undefined;
                }
                if (!(value instanceof Blob)) {
                    throw new TypeError("The cached IndexedDB entry is not a Blob.");
                }
                return value;
            });
        },
        async write(key, contents) {
            await queue.run("write", key, async () => {
                await database.put("entries", contents, key);
            });
        },
        async remove(key) {
            await queue.run("remove", key, async () => {
                await database.delete("entries", key);
            });
        },
        async [Symbol.asyncDispose]() {
            await queue[Symbol.asyncDispose]();
        },
    };
}
