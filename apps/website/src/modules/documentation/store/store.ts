/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { httpStatus, timing } from "../../../shared/constants";
import { type Bootstrap, type PageData, pageDataUrl, pageKey, type ProjectIndex } from "../domain/types";
import { indexesSchema, pageSchema } from "../domain/validation";
import { createProjectWorkers } from "./project-workers";


/**
 * Describes documentation state.
 */
export interface DocumentationState {
    indexes: ProjectIndex[];
    pages: Record<string, PageData>;
    loading: Record<string, boolean>;
    errors: Record<string, string | undefined>;
    updating: Record<string, boolean>;
}
/**
 * Describes documentation store.
 */
export interface DocumentationStore {
    subscribe(this: void, listener: () => void): () => void;
    getSnapshot(this: void): DocumentationState;
    getServerSnapshot(this: void): DocumentationState;
    start(): void;
    stop(): void;
    ensureProject(index: ProjectIndex): void;
    ensurePage(index: ProjectIndex, route: string): Promise<void>;
    update(index: ProjectIndex): void;
}
/**
 * Creates the documentation store and owns its browser resource lifetimes.
 *
 * @param bootstrap The bootstrap value.
 * @returns The prepared result.
 * @throws {Error} If the supplied input or current state is invalid.
 */
export function createDocumentationStore(bootstrap: Bootstrap): DocumentationStore {
    const pages: Record<string, PageData> = {};
    const initialIndex = bootstrap.indexes.find(
        index => bootstrap.page?.route.startsWith(`/${index.project.id}/`) === true,
    );
    if (initialIndex !== undefined && bootstrap.page !== undefined) {
        pages[pageKey(initialIndex, bootstrap.page.route)] = bootstrap.page;
    }
    const initial: DocumentationState = { indexes: bootstrap.indexes, pages, loading: {}, errors: {}, updating: {} };
    let state = initial;
    const listeners = new Set<() => void>();
    const requests = new Map<string, Promise<void>>();
    let active = false;
    let stream: EventSource | undefined;
    let timer: ReturnType<typeof setInterval> | undefined;
    /**
     * Publishes a replacement immutable store snapshot.
     *
     * @param next The next value.
     */
    function publish(next: DocumentationState): void {
        state = next;
        for (const listener of listeners) {
            listener();
        }
    }
    const workers = createProjectWorkers({
        project(data) {
            const nextPages = Object.fromEntries(
                Object.entries(state.pages).filter(([key]) => !key.startsWith(`${data.index.project.id}:`)),
            );
            for (const page of Object.values(data.pages)) {
                nextPages[pageKey(data.index, page.route)] = page;
            }
            publish({
                ...state,
                indexes: state.indexes.map(index => (index.project.id === data.index.project.id ? data.index : index)),
                pages: nextPages,
            });
        },
        status(id, updating, error) {
            publish({
                ...state,
                updating: { ...state.updating, [id]: updating },
                errors: { ...state.errors, [id]: error },
            });
        },
    });
    /**
     * Refreshes development inventories after a source notification.
     *
     * @returns Completion after refreshing the visible inventory.
     * @rejects If loading, validation or resource cleanup fails.
     * @throws {Error} If the supplied input or current state is invalid.
     */
    async function refreshIndexes(): Promise<void> {
        try {
            const response = await fetch("/__docs/indexes", { cache: "no-store" });
            if (!response.ok) {
                throw new Error(`Source refresh failed: ${response.status}`);
            }
            const indexes = indexesSchema.parse(await response.json());
            publish({ ...state, indexes });
        } catch (error) {
            publish({ ...state, errors: { ...state.errors, sources: String(error) } });
        }
    }
    return {
        subscribe(listener: () => void) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        getSnapshot: () => state,
        getServerSnapshot: () => initial,
        start() {
            if (active) {
                return;
            }
            active = true;
            if (bootstrap.development) {
                stream = new EventSource("/__docs/events");
                /**
                 * Handles stream onmessage.
                 */
                stream.onmessage = () => {
                    void refreshIndexes();
                };
            }
            timer = setInterval(() => {
                workers.check();
            }, timing.poll);
        },
        stop() {
            active = false;
            stream?.close();
            clearInterval(timer);
            workers.stop();
        },
        ensureProject(index: ProjectIndex) {
            if (!bootstrap.development && index.project.archiveUrl !== undefined) {
                workers.ensure(index);
            }
        },
        async ensurePage(index: ProjectIndex, route: string): Promise<void> {
            const key = pageKey(index, route);
            if (state.pages[key] !== undefined) {
                return;
            }
            const existing = requests.get(key);
            if (existing !== undefined) {
                return existing;
            }
            const operation = (async () => {
                publish({
                    ...state,
                    loading: { ...state.loading, [key]: true },
                    errors: { ...state.errors, [key]: undefined },
                });
                try {
                    const url = bootstrap.development
                        ? `/__docs/page?project=${encodeURIComponent(index.project.id)}&route=${encodeURIComponent(route)}`
                        : encodeURI(pageDataUrl(index, route));
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(
                            response.status === httpStatus.notFound
                                ? "Page not found."
                                : `Page request failed: ${response.status}`,
                        );
                    }
                    const page = pageSchema.parse(await response.json());
                    if (page.route !== route) {
                        throw new Error("Page response does not match the requested route.");
                    }
                    publish({ ...state, pages: { ...state.pages, [key]: page } });
                } catch (error) {
                    publish({ ...state, errors: { ...state.errors, [key]: String(error) } });
                } finally {
                    publish({ ...state, loading: { ...state.loading, [key]: false } });
                    requests.delete(key);
                }
            })();
            requests.set(key, operation);
            return operation;
        },
        update(index: ProjectIndex) {
            if (bootstrap.development) {
                void fetch(`/__docs/refresh?project=${encodeURIComponent(index.project.id)}`, { method: "POST" });
            } else if (index.project.archiveUrl !== undefined) {
                workers.update(index);
            }
        },
    };
}
