/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { HookContext, Reference, WatchSubscription, WatchSubscriptionContext } from "../../types";
import { getReferenceKey } from "../pipeline/reference";
import { defer } from "../defer";


/** Session subscriptions borrowing their resource stack from compile. */
export interface WatchSubscriptions {
    /** Registers a source subscription, reusing the first registration for its identity. */
    readonly watch: HookContext["watch"];
    /** Source identities registered through session hooks and retained for the session. */
    readonly global: Set<string>;

    /**
     * Removes subscriptions outside the retained set and awaits their cleanup.
     * Runs cleanup sequentially in reverse registration order, attempting every removal.
     *
     * @param keep Source identities still needed by the session or replacement build.
     * @returns Completion of all removed subscriptions' cleanup.
     * @rejects If cleanup fails; multiple failures are chained in a SuppressedError.
     */
    prune(this: void, keep: ReadonlySet<string>): Promise<void>;
}

/**
 * Registers plugin subscriptions with compiler-owned session resources.
 *
 * @param resources Compiler-owned watcher cleanup stack.
 * @param context Session notifications and cancellation.
 * @returns Deduplicated subscriptions identified by opaque source identities.
 */
export function createWatchSubscriptions(
    resources: AsyncDisposableStack,
    context: WatchSubscriptionContext,
): WatchSubscriptions {
    const subscriptions = new Map<string, Promise<void> & AsyncDisposable>();
    resources.defer(async () => {
        const cleanup = new AsyncDisposableStack();
        for (const subscription of subscriptions.values()) {
            void cleanup.use(subscription);
        }
        try {
            await cleanup.disposeAsync();
        } finally {
            subscriptions.clear();
        }
    });

    return {
        global: new Set(),
        async watch(reference: Reference, subscribe: WatchSubscription) {
            context.signal.throwIfAborted();
            const key = getReferenceKey(reference);
            const existing = subscriptions.get(key);
            if (existing !== undefined) {
                return existing;
            }

            const pending = defer(() => subscribe(context));
            let closing: Promise<void> | undefined;
            const entry = Object.assign(
                pending.then(() => undefined),
                {
                    async [Symbol.asyncDispose](this: void) {
                        return (closing ??= pending.then(
                            cleanup => cleanup(),
                            () => undefined,
                        ));
                    },
                },
            );
            subscriptions.set(key, entry);

            try {
                await entry;
            } catch (error) {
                subscriptions.delete(key);
                throw error;
            }
        },
        async prune(keep) {
            await using cleanup = new AsyncDisposableStack();
            for (const [key, subscription] of subscriptions) {
                if (keep.has(key)) {
                    continue;
                }

                subscriptions.delete(key);
                void cleanup.use(subscription);
            }
        },
    };
}
