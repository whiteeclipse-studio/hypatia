/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { DocumentationArtifact } from "../types.ts";
import { requireCondition } from "../errors.ts";
import { decodeText } from "../assets/index.ts";
import { resolveLimits } from "../limits.ts";
import { runTask } from "../workers/task.ts";
import type { RenderOptions, RenderedPage } from "./render-content.ts";

export type { RenderOptions, RenderedPage };

/**
 * Resolves a page for SSR or browser display in a deadline-limited sanitization worker.
 *
 * @param artifact - Previously validated artifact.
 * @param pageId - Stable manifest page identifier.
 * @param options - Project root and host-specific asset mappings.
 * @returns Sanitized article and independent disclosures.
 * @rejects For unknown pages, missing files, unsafe mappings, or worker failures.
 */
export async function renderPage(
    artifact: DocumentationArtifact,
    pageId: string,
    options: RenderOptions = {},
): Promise<RenderedPage> {
    const page = artifact.manifest.pages.find(function matching(candidate): boolean {
        return candidate.id === pageId;
    });
    requireCondition(page !== undefined, `Unknown documentation page: ${pageId}`, "missing-page");
    const bytes = artifact.files.get(page.path);
    requireCondition(bytes !== undefined, `Missing article: ${page.path}`, "missing-page");
    const limits = resolveLimits();
    requireCondition(bytes.byteLength <= limits.maxFileBytes, "Article exceeds render limit", "limits");
    const worker = new Worker(new URL("../workers/artifact.worker.ts", import.meta.url), { type: "module" });
    const result = await runTask(worker, {
        kind: "render",
        limits,
        input: {
            page,
            html: decodeText(bytes),
            repositoryName: artifact.manifest.source.name,
            options,
            assets: artifact.manifest.files.filter(function asset(file): boolean {
                return file.kind === "asset";
            }),
        },
    });
    requireCondition(result.kind === "rendered", "Unexpected render worker reply");
    return result.page;
}
