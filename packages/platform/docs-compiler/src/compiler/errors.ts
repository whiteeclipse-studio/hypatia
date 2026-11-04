/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/**
 * Throws collected failures without changing their order or values.
 *
 * @param errors Failures collected after all required operations were attempted.
 * @param message Message identifying the failed operation.
 * @param options Optional cause for the aggregate error.
 * @throws {AggregateError} If the collection contains any failures.
 */
export function throwIfErrors(errors: readonly unknown[], message: string, options?: ErrorOptions): void {
    if (errors.length > 0) {
        throw new AggregateError(errors, message, options);
    }
}

/**
 * Throws rejection reasons in input order, ignoring fulfilled results.
 *
 * @param results Settled operations whose rejection reasons should be collected.
 * @param message Message identifying the failed operation.
 * @param options Optional cause for the aggregate error.
 * @throws {AggregateError} If any operation was rejected.
 */
export function throwIfRejected(
    results: readonly PromiseSettledResult<unknown>[],
    message: string,
    options?: ErrorOptions,
): void {
    const errors: unknown[] = [];
    for (const result of results) {
        if (result.status === "rejected") {
            errors.push(result.reason);
        }
    }
    throwIfErrors(errors, message, options);
}
