/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { realpath } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { buildDocumentation } from "../build/index.ts";
import { loadConfiguration } from "../build/configuration.ts";
import { readBoundedFile } from "../build/files.ts";
import { loadArtifact, packArtifact } from "../artifact/index.ts";
import { downloadArtifact } from "../browser/download.ts";
import { defaultLimits } from "../limits.ts";
import { requireCondition } from "../errors.ts";
import type { DocumentationSource, LoadedProject } from "./types.ts";

/**
 * Loads sources with local development and artifact-only production semantics.
 *
 * @param sources - Configured repository and artifact locations.
 * @param root - Vite's resolved application root.
 * @param development - Whether local source processing is allowed.
 * @returns Validated projects with unique repository URL roots.
 * @rejects For missing artifacts, download failures, invalid content, or root collisions.
 */
export async function loadProjects(
    sources: DocumentationSource[],
    root: string,
    development: boolean,
): Promise<LoadedProject[]> {
    const projects: LoadedProject[] = [];
    const names = new Set<string>();
    for (const source of sources) {
        const project = await loadProject(source, root, development);
        const name = project.artifact.manifest.source.name.toLowerCase();
        requireCondition(!names.has(name), `Conflicting documentation project root: ${name}`, "collision");
        names.add(name);
        projects.push(project);
    }
    return projects;
}

/**
 * Builds one local development source or consumes its configured prebuilt artifact.
 *
 * @param source - A repository's source configuration.
 * @param root - Vite application root.
 * @param development - Whether source builds are permitted.
 * @returns A validated project and watch dependencies.
 * @rejects For source, configuration, archive, or download failures.
 */
async function loadProject(source: DocumentationSource, root: string, development: boolean): Promise<LoadedProject> {
    if (development && source.local !== undefined) {
        const repositoryRoot = resolve(root, source.local.repositoryRoot);
        const config = await loadConfiguration(repositoryRoot, source.local.configFile);
        const result = await buildDocumentation({ ...config.options, ...source.local.options, repositoryRoot });
        const dependencies = [...result.dependencies, resolve(repositoryRoot, "documentation.config.mjs")];
        if (config.file !== undefined) {
            dependencies.push(config.file);
        }
        return {
            artifact: result,
            archive: await packArtifact(result, source.local.options?.limits ?? config.options.limits),
            dependencies,
        };
    }
    requireCondition(
        source.artifact !== undefined,
        "Production sources require a prebuilt artifact; Markdown processing is development-only",
        "configuration",
    );
    if (/^https?:\/\//u.test(source.artifact)) {
        const artifact = await downloadArtifact(source.artifact);
        return { artifact, archive: await packArtifact(artifact), dependencies: [] };
    }
    const path = resolve(root, source.artifact);
    const directory = await realpath(dirname(path));
    const archive = await readBoundedFile(directory, path, defaultLimits.maxCompressedBytes);
    return { artifact: await loadArtifact(archive), archive, dependencies: [path] };
}
