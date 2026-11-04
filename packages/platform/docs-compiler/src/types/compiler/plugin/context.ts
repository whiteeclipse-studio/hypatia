/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { CacheAdapter } from "@whiteeclipse/cache";
import type { Logger } from "@whiteeclipse/log";
import type { Promisable } from "type-fest";
import type { Reference } from "../reference.js";
import type { WatchSubscription } from "../watch.js";


/** Services shared by compiler hooks. */
export interface BaseHookContext {
    /** Logger for hook diagnostics. */
    readonly logger: Logger;
    /** Compilation cancellation signal. */
    readonly signal: AbortSignal;

    /**
     * Registers cleanup with the compilation's owner.
     *
     * @param cleanup Callback run on failure or disposal.
     */
    onDispose(this: void, cleanup: () => Promisable<void>): void;
}

/** Services available after cache configuration is finalized. */
export interface HookContext extends BaseHookContext {
    /** Shared compiler-owned storage. Plugins must not dispose this adapter. */
    readonly cache: CacheAdapter;

    /**
     * Registers one subscription per opaque source identity for the watch session.
     *
     * Repeated registrations reuse the first subscription. During source processing,
     * the watched source also becomes a dependency of the current source. Register
     * repository subscriptions in configResolved to cover the initial build.
     * One-shot compilation does not start subscriptions.
     *
     * @param reference Source identifying the subscription.
     * @param subscribe Starts watching and returns cleanup.
     * @returns Completion of subscription setup.
     * @rejects If setup fails or the session is closing.
     */
    watch(this: void, reference: Reference, subscribe: WatchSubscription): Promise<void>;
}
