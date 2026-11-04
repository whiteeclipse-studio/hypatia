/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Repository } from "./repository.ts";


/**
 * An immutable compilation result, keyed by repository ID.
 *
 * Owns repository and artifact handles, compilation resources, and cached payloads.
 *
 * A one-shot snapshot owns its cache. During watching, the session owns the cache;
 * publishing a replacement invalidates the previous snapshot. Old reads drain
 * before entries exclusive to the old generation are removed.
 *
 * Invalid snapshots throw ReferenceError on map access and iterator steps.
 * Previously returned metadata and content remain usable.
 * One-shot compilation is implemented; watch reuse remains exploratory under
 * draft RFC-0005 and is not implemented yet.
 */
export interface Snapshot extends ReadonlyMap<string, Repository>, AsyncDisposable {
    /**
     * Invalidates handles, waits for started reads, then releases resources.
     *
     * New reads reject immediately. Cleanup waits until borrowed cache content
     * is consumed and disposes the cache if owned.
     *
     * All cleanup is attempted once. Repeated calls share the same result.
     *
     * @returns Completion of cleanup.
     * @rejects With an AggregateError containing cleanup failures.
     */
    [Symbol.asyncDispose](this: void): Promise<void>;
}
