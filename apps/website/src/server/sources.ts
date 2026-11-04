/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { compile, type WatchResult } from "@whiteeclipse/docs-compiler";
import type { ProjectConfiguration, PublicProject, WebsiteConfiguration } from "../app/configuration";
import type { PreparedProject, ProjectIndex } from "../modules/documentation/domain/types";
import { prepareProject } from "../rendering/prepare-project";
import { sourceConfiguration, validateProjects } from "./source-configuration";


/**
 * Owns source sessions and exposes independently owned website data.
 */
export interface SourceService extends AsyncDisposable {
    indexes(): ProjectIndex[];
    get(id: string): PreparedProject | undefined;
    refresh(id: string): void;
    subscribe(listener: () => void): () => void;
}

/**
 * Loads configured repositories and owns development watch sessions.
 *
 * @param configuration The configuration value.
 * @param development The development value.
 * @param root The root value.
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 * @throws {Error} If the supplied input or current state is invalid.
 */
export async function createSources(
    configuration: WebsiteConfiguration,
    development: boolean,
    root: string,
): Promise<SourceService> {
    validateProjects(configuration.projects);
    const projects = new Map<string, PreparedProject>();
    const listeners = new Set<() => void>();
    const refreshers = new Map<string, () => void>();
    const sessions: WatchResult[] = [];
    const pumps: Promise<void>[] = [];
    /**
     * Loads one project and prepares owned data before compiler publication.
     *
     * @param project The project value.
     * @returns The prepared result.
     * @rejects If loading, validation or resource cleanup fails.
     * @throws {Error} If the supplied input or current state is invalid.
     */
    async function load(project: ProjectConfiguration): Promise<void> {
        const publicProject: PublicProject = {
            id: project.id,
            name: project.name,
            archiveUrl: project.archiveUrl,
            updateTtlMs: project.updateTtlMs,
        };
        const input = sourceConfiguration(project, development, root, refreshers);
        let prepared: PreparedProject | undefined;
        input.plugins.push({
            name: "website-pages",
            async buildEnd(repositories) {
                if (repositories.length !== 1 || repositories[0] === undefined) {
                    throw new Error(`Expected one repository for ${project.id}.`);
                }
                prepared = await prepareProject(
                    repositories[0],
                    publicProject satisfies PublicProject,
                    crypto.randomUUID(),
                );
            },
        });
        /**
         * Publishes only independently owned values after compilation succeeds.
         */
        function publish(): void {
            if (prepared === undefined) {
                return;
            }
            projects.set(project.id, prepared);
            for (const listener of listeners) {
                listener();
            }
        }
        if (!development) {
            await using snapshot = await compile(input);
            if (snapshot.size > 0) {
                publish();
            }
            return;
        }
        const session = await compile({ ...input, watch: true });
        sessions.push(session);
        const iterator = session[Symbol.asyncIterator]();
        await iterator.next();
        publish();
        pumps.push(consume(iterator, publish));
        pumps.push(reportErrors(session));
    }
    try {
        for (const project of configuration.projects) {
            await load(project);
        }
    } catch (error) {
        await Promise.allSettled(sessions.map(async session => session[Symbol.asyncDispose]()));
        throw error;
    }
    return {
        indexes: () => [...projects.values()].map(project => project.index),
        get: id => projects.get(id),
        refresh: id => refreshers.get(id)?.(),
        subscribe(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        async [Symbol.asyncDispose]() {
            await Promise.allSettled(sessions.map(async session => session[Symbol.asyncDispose]()));
            await Promise.allSettled(pumps);
        },
    };
}

/**
 * Consumes replacement notifications without reading retired snapshot handles.
 *
 * @param iterator The iterator value.
 * @param publish The publish value.
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 */
async function consume(iterator: AsyncIterator<unknown>, publish: () => void): Promise<void> {
    for (;;) {
        const next = await iterator.next();
        if (next.done === true) {
            break;
        }
        publish();
    }
}

/**
 * Reports recoverable source failures while the last valid generation remains active.
 *
 * @param session The session value.
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 */
async function reportErrors(session: WatchResult): Promise<void> {
    for await (const error of session.errors) {
        process.stderr.write(`${String(error)}\n`);
    }
}
