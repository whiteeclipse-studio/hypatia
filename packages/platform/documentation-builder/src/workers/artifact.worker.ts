/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { decodeArtifact, encodeArtifact } from "../artifact/codec.ts";
import { validateArtifactData } from "../artifact/validate.ts";
import { requireCondition } from "../errors.ts";
import { renderContent } from "../artifact/render-content.ts";
import { workerFailure } from "./task.ts";
import type { WorkerReply, WorkerRequest } from "./protocol.ts";

/**
 * Processes archives and imported files without filesystem APIs or source plugins.
 *
 * @param request - Portable artifact operation.
 * @returns Validated content or deterministic archive bytes.
 * @rejects For malformed content, resource failures, or unsupported requests.
 */
async function processRequest(request: WorkerRequest): Promise<WorkerReply> {
    requireCondition(request.kind !== "build", "Source building is unavailable in the artifact reader");
    if (request.kind === "render") {
        return { kind: "rendered", page: renderContent(request.input) };
    }
    if (request.kind === "pack") {
        const artifact = await validateArtifactData(request.artifact.files, request.limits);
        return { kind: "archive", bytes: await encodeArtifact(artifact, request.limits) };
    }
    const artifact =
        request.kind === "load"
            ? await decodeArtifact(request.bytes, request.limits)
            : await validateArtifactData(request.files, request.limits);
    return { kind: "artifact", artifact, diagnostics: [] };
}

/**
 * Dispatches a portable operation and serializes its result.
 *
 * @param event - Trusted parent request containing untrusted archive or HTML bytes.
 */
self.addEventListener("message", function message(event: MessageEvent<WorkerRequest>): void {
    processRequest(event.data).then(
        function success(result): void {
            self.postMessage(result);
        },
        function failure(error: unknown): void {
            self.postMessage(workerFailure(error));
        },
    );
});
