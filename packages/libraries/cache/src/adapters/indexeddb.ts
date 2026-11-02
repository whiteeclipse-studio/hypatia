/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { type DBSchema, openDB } from "idb";
import type { CacheAdapter } from "../types.ts";
import { createCacheOperationQueue } from "../operations.ts";
import { getLogger } from "@whiteeclipse/log";


const logger = getLogger(["whiteeclipse", "cache", "indexeddb"]);

/** Persistent Blob cache scoped to an IndexedDB database name. */
export interface IndexedDbCacheAdapter extends CacheAdapter {
    /** Database owned by this adapter; entries survive connection disposal. */
    readonly name: string;
}

/** Version-one schema for a dedicated cache database. */
interface CacheDatabase extends DBSchema {
    entries: {
        key: string;
        value: Blob;
    };
}

/**
 * Opens a dedicated IndexedDB database storing Blobs under opaque string keys.
 *
 * Writes resolve after transaction commit. Disposal drains admitted operations
 * and closes this connection without deleting stored entries. Reopening the same
 * name reuses its data. Other connections and browser storage eviction remain
 * outside the adapter's operation queue. A version change closes the connection
 * to allow upgrades or database deletion; subsequent operations reject.
 *
 * @param name Database name reserved for this adapter's schema.
 * @returns A persistent cache with an asynchronously disposable connection.
 * @rejects If IndexedDB is unavailable, opening fails, or the database schema is incompatible.
 */
export async function createIndexedDbCacheAdapter(name: string): Promise<IndexedDbCacheAdapter> {
    if (typeof indexedDB === "undefined") {
        const error = new Error("IndexedDB is unavailable in this environment.");
        logger.error("Cannot open IndexedDB cache.", { error });
        throw error;
    }

    const database = await openDB<CacheDatabase>(name, 1, {
        /**
         * Initializes the dedicated cache store on first open.
         *
         * @param db Database being initialized.
         */
        upgrade(db) {
            db.createObjectStore("entries");
        },

        /** Releases this connection when another client requests a schema change. */
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
        await Promise.resolve();
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
