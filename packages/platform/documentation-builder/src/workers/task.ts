/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { DocumentationError } from "../errors.ts";
import type { WorkerReply, WorkerRequest } from "./protocol.ts";

/**
 * Executes one bounded task and terminates its worker on completion, failure, or timeout.
 *
 * @param worker - A freshly created package worker.
 * @param request - Serializable inputs with resolved limits.
 * @returns The worker's response.
 * @rejects For worker errors, processing failures, or an exceeded deadline.
 */
export async function runTask(
    worker: Worker,
    request: WorkerRequest,
): Promise<Exclude<WorkerReply, { kind: "error" }>> {
    return new Promise(function task(resolve, reject): void {
        const timer = setTimeout(function deadline(): void {
            worker.terminate();
            reject(new DocumentationError("timeout", "Documentation processing deadline exceeded"));
        }, request.limits.timeoutMs);
        /**
         * Resolves a completed worker operation and releases its resources.
         *
         * @param event - Trusted package-worker response.
         * @rejects The owning task when the worker reports a processing failure.
         */
        function reply(event: MessageEvent<WorkerReply>): void {
            clearTimeout(timer);
            worker.terminate();
            if (event.data.kind === "error") {
                reject(new DocumentationError(event.data.code, event.data.message));
            } else {
                resolve(event.data);
            }
        }
        /**
         * Reports runtime failures rather than leaving a pending task.
         *
         * @param event - Worker runtime error.
         * @rejects The owning task when its worker cannot execute.
         */
        function failure(event: ErrorEvent): void {
            clearTimeout(timer);
            worker.terminate();
            reject(new DocumentationError("worker", event.message));
        }
        /**
         * Rejects structured-clone failures and releases the worker.
         *
         * @rejects The owning task when the response cannot be deserialized.
         */
        function cloneFailure(): void {
            clearTimeout(timer);
            worker.terminate();
            reject(new DocumentationError("worker", "Cannot deserialize documentation worker response"));
        }
        worker.addEventListener("message", reply);
        worker.addEventListener("error", failure);
        worker.addEventListener("messageerror", cloneFailure);
        try {
            worker.postMessage(request);
        } catch (error) {
            clearTimeout(timer);
            worker.terminate();
            reject(new DocumentationError("worker", "Cannot submit documentation worker request", { cause: error }));
        }
    });
}

/**
 * Serializes a processing failure without losing its meaningful error category.
 *
 * @param error - Original thrown value.
 * @returns A structured-cloneable error response.
 */
export function workerFailure(error: unknown): WorkerReply {
    return {
        kind: "error",
        code: error instanceof DocumentationError ? error.code : "processing",
        message: error instanceof Error ? error.message : String(error),
    };
}
