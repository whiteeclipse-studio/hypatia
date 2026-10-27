/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { ViteDevServer } from "vite";
import type { LoadedProject } from "./types.ts";
import { projectOutputs } from "./output.ts";

const reloadDelayMs = 75;

/** Snapshot access lets development avoid owning website routing or UI. */
export interface DevelopmentState {
    /** Returns the last completely validated project snapshots. */
    projects(): LoadedProject[];
    /** Rebuilds all sources, rejecting failures without replacing usable snapshots. */
    refresh(): Promise<void>;
    base: string;
    virtualId: string;
}

/**
 * Serves assets and baseline archives and watches validated source dependencies.
 *
 * @param server - Vite development server.
 * @param state - Shared snapshot operations.
 */
export function configureDevelopment(server: ViteDevServer, state: DevelopmentState): void {
    server.middlewares.use(function documentationAsset(request, response, next): void {
        const target = request.url?.split("?")[0];
        const output = state
            .projects()
            .flatMap(projectOutputs)
            .find(function matches(file): boolean {
                return `${state.base}${file.path.split("/").map(encodeURIComponent).join("/")}` === target;
            });
        if (output === undefined) {
            next();
            return;
        }
        response.setHeader("Content-Type", output.mediaType);
        response.setHeader("X-Content-Type-Options", "nosniff");
        if (output.mediaType === "application/pdf") {
            response.setHeader("Content-Disposition", "attachment");
        }
        response.end(output.content);
    });
    watchSources(server, state);
}

/**
 * Debounces edits and retains the last good snapshot after failed rebuilding.
 *
 * @param server - Vite server.
 * @param state - Snapshot operations.
 */
function watchSources(server: ViteDevServer, state: DevelopmentState): void {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let closed = false;
    let sequence = Promise.resolve();
    /**
     * Schedules relevant source and plugin dependency changes.
     *
     * @param file - Changed absolute path.
     */
    function changed(file: string): void {
        const watched = state.projects().flatMap(function dependencies(project): string[] {
            return project.dependencies;
        });
        if (
            !watched.some(function relevant(path): boolean {
                return file === path || file.startsWith(`${path}/`);
            })
        ) {
            return;
        }
        clearTimeout(timer);
        timer = setTimeout(function schedule(): void {
            sequence = sequence.then(rebuild).catch(function report(error: unknown): void {
                server.ws.send({
                    type: "error",
                    err: { message: error instanceof Error ? error.message : String(error), stack: "" },
                });
            });
        }, reloadDelayMs);
    }
    /**
     * Invalidates SSR and browser module graphs after successful source rebuilding.
     *
     * @returns Completion after module invalidation.
     * @rejects For source failures, preserving the previous snapshot.
     */
    async function rebuild(): Promise<void> {
        if (closed) {
            return;
        }
        await state.refresh();
        server.watcher.add(
            state.projects().flatMap(function dependencies(project): string[] {
                return project.dependencies;
            }),
        );
        for (const environment of Object.values(server.environments)) {
            const module = environment.moduleGraph.getModuleById(state.virtualId);
            if (module !== undefined) {
                environment.moduleGraph.invalidateModule(module);
            }
            environment.hot.send({ type: "full-reload" });
        }
    }
    /** Removes listeners and pending reload work at shutdown. */
    function cleanup(): void {
        closed = true;
        clearTimeout(timer);
        server.watcher.off("add", changed).off("change", changed).off("unlink", changed);
    }
    server.watcher.on("add", changed).on("change", changed).on("unlink", changed);
    server.watcher.once("close", cleanup);
}
