/* Copyright © 2026 White Eclipse. Released under the MIT License. */

/** An actionable builder, archive, security, or resource failure. */
export class DocumentationError extends Error {
    /**
     * Creates a failure with a machine-readable code and optional original cause.
     *
     * @param code - Stable failure category.
     * @param message - Human-readable explanation.
     * @param options - Original failure, when available.
     */
    constructor(
        public readonly code: string,
        message: string,
        options?: ErrorOptions,
    ) {
        super(message, options);
        this.name = "DocumentationError";
    }
}

/**
 * Requires an invariant without narrowing untrusted values through assertions.
 *
 * @param condition - Required invariant.
 * @param message - Explanation when the invariant fails.
 * @param code - Failure category.
 * @throws {DocumentationError} When the invariant is false.
 */
export function requireCondition(condition: boolean, message: string, code = "invalid-artifact"): asserts condition {
    if (!condition) {
        throw new DocumentationError(code, message);
    }
}
