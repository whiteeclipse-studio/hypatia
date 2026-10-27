/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { processSources } from "../source/pipeline.ts";
import { requireCondition } from "../errors.ts";
import { workerFailure } from "./task.ts";
import type { WorkerReply, WorkerRequest } from "./protocol.ts";

/**
 * Runs the Bun-only source pipeline; executable repository plugins have already completed.
 *
 * @param request - Source-processing request.
 * @returns Serializable build output.
 * @rejects For source processing or validation failures.
 */
async function processRequest(request: WorkerRequest): Promise<WorkerReply> {
    requireCondition(request.kind === "build", "Unsupported source worker operation");
    const result = await processSources(request.input);
    return { kind: "artifact", ...result };
}

/**
 * Dispatches a source operation and serializes success or failure.
 *
 * @param event - Trusted parent request containing untrusted source content.
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
