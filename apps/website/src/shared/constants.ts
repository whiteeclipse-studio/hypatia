/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

export const httpStatus = {
    ok: 200,
    accepted: 202,
    moved: 301,
    unchanged: 304,
    badRequest: 400,
    forbidden: 403,
    notFound: 404,
    error: 500,
} as const;

export const timing = {
    poll: 60_000,
    timeout: 30_000,
    heartbeat: 15_000,
    retry: 300_000,
    assetRetirement: 1000,
    processing: 45_000,
} as const;
