/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { createIndexedDbCacheAdapter } from "@whiteeclipse/cache/indexeddb";
import { z } from "zod";
import type { CacheAdapter } from "@whiteeclipse/cache";


/**
 * Describes archive record.
 */
export interface ArchiveRecord {
    version: 1;
    archiveKey: string;
    checkedAt: number;
    retryAt: number;
    etag?: string | undefined;
    modified?: string | undefined;
}
/**
 * Metadata points only at complete immutable archives. Compiler caches use separate databases.
 *
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 */
export async function archiveStorage(): Promise<CacheAdapter> {
    return createIndexedDbCacheAdapter("whiteeclipse-website-archives-v1");
}
/**
 * Reads and validates a persisted archive record.
 *
 * @param storage The storage value.
 * @param url The url value.
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 */
export async function readRecord(storage: CacheAdapter, url: string): Promise<ArchiveRecord | undefined> {
    const blob = await storage.read(`record:${url}`);
    if (blob === undefined) {
        return undefined;
    }
    const record = z
        .object({
            version: z.literal(1),
            archiveKey: z.string(),
            checkedAt: z.number(),
            retryAt: z.number(),
            etag: z.string().optional(),
            modified: z.string().optional(),
        })
        .parse(JSON.parse(await blob.text()));
    return record;
}
/**
 * Atomically replaces the active archive record.
 *
 * @param storage The storage value.
 * @param url The url value.
 * @param record The record value.
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 */
export async function writeRecord(storage: CacheAdapter, url: string, record: ArchiveRecord): Promise<void> {
    await storage.write(`record:${url}`, new Blob([JSON.stringify(record)], { type: "application/json" }));
}
