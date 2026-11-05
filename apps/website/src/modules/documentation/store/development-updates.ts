/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import type { ProjectIndex } from "../domain/types";
import { indexesSchema } from "../domain/validation";


/**
 * Loads the current validated development inventory.
 *
 * @returns Available project indexes.
 * @rejects If the request or inventory validation fails.
 */
export async function loadDevelopmentIndexes(): Promise<ProjectIndex[]> {
    const response = await fetch("/__docs/indexes", { cache: "no-store" });
    if (!response.ok) {
        throw new Error(`Source refresh failed: ${response.status}`);
    }
    return indexesSchema.parse(await response.json());
}

/**
 * Requests a development refresh and reloads the current validated inventory.
 *
 * @param id Project identifier.
 * @returns Available project indexes after the refresh request succeeds.
 * @rejects If either request or inventory validation fails.
 */
export async function refreshDevelopmentProject(id: string): Promise<ProjectIndex[]> {
    const response = await fetch(`/__docs/refresh?project=${encodeURIComponent(id)}`, { method: "POST" });
    if (!response.ok) {
        throw new Error(`Documentation refresh failed: ${response.status}`);
    }
    return loadDevelopmentIndexes();
}
