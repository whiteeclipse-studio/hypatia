/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Reference, Snapshot } from "../../../types/index.js";
import type { LatestChannel } from "../channel.js";
import type { WatchOperations } from "./index.js";


/** Mutable lifecycle coordination shared by scheduling and shutdown operations. */
interface SchedulerLifecycle {
    /** Whether the initial build succeeded and rebuild scheduling is enabled. */
    started: boolean;
    /** Whether shutdown has stopped change admission and result delivery. */
    closed: boolean;
    /** Active rebuild worker, including publication and previous-generation retirement. */
    running: Promise<void> | undefined;
    /** Shared final cleanup outcome for repeated shutdown requests. */
    disposal: Promise<void> | undefined;
}

/** State for one watch session; resource ownership remains with the compiler. */
export interface SchedulerState {
    /** Borrowed build, cancellation, and final resource-cleanup operations. */
    readonly operations: WatchOperations;
    /** Delivery of the latest unread successful snapshot. */
    readonly snapshots: LatestChannel<Snapshot>;
    /** Delivery of the latest unread recoverable failure. */
    readonly errors: LatestChannel<unknown>;
    /** Changed sources awaiting a build, deduplicated by source identity. */
    readonly pending: Map<string, Reference>;
    /** Invalidations retained after failure until another notification schedules a build. */
    readonly retry: Map<string, Reference>;
    /** Lifecycle flags and operation promises updated as the session progresses. */
    readonly lifecycle: SchedulerLifecycle;
}
