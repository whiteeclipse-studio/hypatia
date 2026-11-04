/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { timing } from "../../../shared/constants";
import type { PreparedProject, ProjectIndex } from "../domain/types";
import type { WorkerRequest, WorkerResponse } from "../worker/protocol";


/** Owns worker sessions, update deadlines and browser asset URLs. */
export interface ProjectWorkers {
    ensure(index: ProjectIndex, force?: boolean): void;
    update(index: ProjectIndex): void;
    check(): void;
    stop(): void;
}

/**
 * Creates browser worker clients without starting a worker during server rendering.
 *
 * @param callbacks Publication and background-status callbacks.
 * @param callbacks.project Receives complete generations with owned asset URLs.
 * @param callbacks.status Receives project update state.
 * @returns The worker lifecycle controller.
 */
export function createProjectWorkers(callbacks: {
    project(this: void, data: PreparedProject): void;
    status(this: void, id: string, updating: boolean, error?: string): void;
}): ProjectWorkers {
    const workers = new Map<string, Worker>();
    const watchdogs = new Map<string, ReturnType<typeof setTimeout>>();
    const urls = new Map<string, string[]>();
    let stopped = false;
    /**
     * Retires a failed worker while retaining the last independently owned publication.
     *
     * @param id Project identifier.
     * @param error Failure exposed to the reader.
     */
    function fail(id: string, error: string): void {
        clearTimeout(watchdogs.get(id));
        workers.get(id)?.terminate();
        workers.delete(id);
        callbacks.status(id, false, error);
    }
    /**
     * Installs asset URLs for a complete worker publication.
     *
     * @param data Independently owned project data.
     */
    function publish(data: PreparedProject): void {
        const id = data.index.project.id;
        const previous = urls.get(id) ?? [];
        const next: string[] = [];
        const { assets } = data.index;
        for (const [path, blob] of Object.entries(data.assets)) {
            const url = URL.createObjectURL(blob);
            assets[path] = url;
            next.push(url);
        }
        urls.set(id, next);
        callbacks.project(data);
        setTimeout(() => {
            for (const url of previous) {
                URL.revokeObjectURL(url);
            }
        }, timing.assetRetirement);
    }
    /**
     * Applies typed worker publications and starts bounded update deadlines.
     *
     * @param id Project identifier.
     * @param message Worker response.
     */
    function receive(id: string, message: WorkerResponse): void {
        if (stopped) {
            return;
        }
        clearTimeout(watchdogs.get(id));
        if (message.type === "project") {
            publish(message.data);
            return;
        }
        callbacks.status(id, message.updating, message.error);
        if (message.restart === true) {
            workers.get(id)?.terminate();
            workers.delete(id);
        }
        if (message.updating) {
            watchdogs.set(
                id,
                setTimeout(() => {
                    fail(id, "Documentation update timed out. Use Update to retry.");
                }, timing.processing),
            );
        }
    }
    /**
     * Starts a single watch worker per project, or returns its existing client.
     *
     * @param index Project configuration.
     * @param force Whether initialization bypasses the persisted freshness deadline.
     * @returns The existing or newly created worker.
     */
    function ensure(index: ProjectIndex, force = false): Worker {
        stopped = false;
        const existing = workers.get(index.project.id);
        if (existing !== undefined) {
            return existing;
        }
        const worker = new Worker(new URL("../worker/documentation.worker.ts", import.meta.url), { type: "module" });
        workers.set(index.project.id, worker);
        worker.addEventListener("message", (event: MessageEvent<WorkerResponse>) => {
            receive(index.project.id, event.data);
        });
        worker.addEventListener("error", event => {
            fail(index.project.id, event.message);
        });
        worker.postMessage({ type: "start", project: index.project, force } satisfies WorkerRequest);
        return worker;
    }
    return {
        ensure(index, force) {
            ensure(index, force);
        },
        update(index) {
            const existing = workers.get(index.project.id);
            if (existing === undefined) {
                ensure(index, true);
            } else {
                existing.postMessage({ type: "update", force: true } satisfies WorkerRequest);
            }
        },
        check() {
            for (const worker of workers.values()) {
                worker.postMessage({ type: "update", force: false } satisfies WorkerRequest);
            }
        },
        stop() {
            stopped = true;
            for (const worker of workers.values()) {
                worker.postMessage({ type: "close" } satisfies WorkerRequest);
            }
            for (const watchdog of watchdogs.values()) {
                clearTimeout(watchdog);
            }
            for (const values of urls.values()) {
                for (const url of values) {
                    URL.revokeObjectURL(url);
                }
            }
            workers.clear();
            watchdogs.clear();
            urls.clear();
        },
    };
}
