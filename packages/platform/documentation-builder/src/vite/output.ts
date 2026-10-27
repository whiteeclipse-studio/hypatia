/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { createHash } from "node:crypto";
import type { LoadedProject } from "./types.ts";
import { decodeText } from "../assets/index.ts";
import { encodePath } from "../paths.ts";

/** An emitted output is independent of the application's page generation. */
export interface ProjectOutput {
    path: string;
    content: Uint8Array;
    mediaType: string;
}

/**
 * Selects assets, metadata, and an immutable baseline archive for emission.
 *
 * @param project - Validated project snapshot.
 * @returns Outputs preserving asset paths below the repository root.
 */
export function projectOutputs(project: LoadedProject): ProjectOutput[] {
    const name = project.artifact.manifest.source.name;
    const outputs: ProjectOutput[] = [
        { path: archiveOutputPath(project), content: project.archive, mediaType: "application/gzip" },
    ];
    for (const file of project.artifact.manifest.files) {
        if (file.kind === "page") {
            continue;
        }
        outputs.push({
            path: `${name}/${file.path}`,
            content: project.artifact.files.get(file.path) ?? new Uint8Array(),
            mediaType: file.mediaType,
        });
    }
    return outputs;
}

/**
 * Names the baseline by archive bytes, independently of dirty-source commit reuse.
 *
 * @param project - Validated project snapshot.
 * @returns A reserved content-addressed archive location.
 */
export function archiveOutputPath(project: LoadedProject): string {
    const hash = createHash("sha256").update(project.archive).digest("hex");
    return `_documentation/${project.artifact.manifest.source.name}/${hash}.tar.gz`;
}

/**
 * Produces the same page accessors for SSR and hydrated browser consumers.
 *
 * @param projects - Validated snapshots.
 * @param base - Vite URL base.
 * @returns Virtual JavaScript module source.
 */
export function virtualModule(projects: LoadedProject[], base: string): string {
    const definitions = projects.map(function projectCode(project): string {
        const manifest = project.artifact.manifest;
        const entries = manifest.pages.map(function pageContent(page): [string, string] {
            return [page.path, decodeText(project.artifact.files.get(page.path) ?? new Uint8Array())];
        });
        const urls = Object.fromEntries(
            manifest.files
                .filter(function asset(file): boolean {
                    return file.kind === "asset";
                })
                .map(function url(file): [string, string] {
                    return [file.path, `${base}${encodePath(`${manifest.source.name}/${file.path}`)}`];
                }),
        );
        return `{manifest:${JSON.stringify(manifest)},artifactUrl:${JSON.stringify(`${base}${encodePath(archiveOutputPath(project))}`)},assetUrls:${JSON.stringify(urls)},pages:${JSON.stringify(entries)}}`;
    });
    return (
        `import {renderPage} from "@whiteeclipse/documentation-builder/artifact";\n` +
        `import "@whiteeclipse/documentation-builder/styles.css";\n` +
        `const snapshots=[${definitions.join(",")}];\n` +
        `export const projects=snapshots.map(({pages,...project})=>{\n` +
        `const artifact={manifest:project.manifest,files:new Map(pages.map(([path,html])=>[path,new TextEncoder().encode(html)]))};\n` +
        `return {...project,getPage:(id,options={})=>renderPage(artifact,id,{projectRoot:${JSON.stringify(base)}+project.manifest.source.name+"/",...options,assetUrls:{...project.assetUrls,...options.assetUrls}})};\n` +
        `});\nexport default projects;\n`
    );
}
