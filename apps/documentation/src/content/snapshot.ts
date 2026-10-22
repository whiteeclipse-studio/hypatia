/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type {
    DocumentArticle,
    DocumentSummary,
    DocumentationPage,
    DocumentationPublication,
    DocumentationRepository,
} from "./types";

/**
 * Narrows JSON objects without trusting untyped parser results.
 *
 * @param value - Parsed JSON value.
 * @returns Whether the value is a non-array object.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validates the string fields shared by serialized document identities.
 *
 * @param value - Parsed document identity.
 * @returns Whether all required fields have their expected types.
 */
function isDocument(value: unknown): value is DocumentSummary {
    return (
        isRecord(value) &&
        ["repository", "repositoryTitle", "id", "sourcePath", "canonicalPath", "language", "route", "title"].every(
            key => typeof value[key] === "string",
        ) &&
        (value["sourceReference"] === undefined || typeof value["sourceReference"] === "string")
    );
}

/**
 * Validates the public source selector inventory.
 *
 * @param value - Parsed repository entry.
 * @returns Whether the identity and landing route are present.
 */
function isRepository(value: unknown): value is DocumentationRepository {
    return isRecord(value) && ["name", "title", "route"].every(key => typeof value[key] === "string");
}

/**
 * Validates the application-generated article snapshot and final heading identities.
 *
 * @param value - Parsed article.
 * @returns Whether the article is suitable for hydration or build rendering.
 */
function isArticle(value: unknown): value is DocumentArticle {
    return (
        isDocument(value) &&
        "html" in value &&
        typeof value.html === "string" &&
        "headings" in value &&
        Array.isArray(value.headings) &&
        value.headings.every(
            (heading: unknown) =>
                isRecord(heading) &&
                typeof heading["id"] === "string" &&
                typeof heading["title"] === "string" &&
                typeof heading["depth"] === "number",
        )
    );
}

/**
 * Parses a build-produced publication without loading source Markdown during SSG rendering.
 *
 * @param json - Application-generated publication JSON.
 * @returns Validated document identities and sanitized articles.
 * @throws {Error} If the JSON or publication structure is invalid.
 */
export function parsePublication(json: string): DocumentationPublication {
    const value: unknown = JSON.parse(json);
    if (
        !isRecord(value) ||
        typeof value["base"] !== "string" ||
        !Array.isArray(value["repositories"]) ||
        !value["repositories"].every(isRepository) ||
        !Array.isArray(value["documents"]) ||
        !value["documents"].every(isDocument) ||
        !Array.isArray(value["articles"]) ||
        !value["articles"].every(isArticle)
    ) {
        throw new Error("Invalid documentation publication snapshot.");
    }
    return {
        base: value["base"],
        repositories: value["repositories"],
        documents: value["documents"],
        articles: value["articles"],
    };
}

/**
 * Restores the exact server-rendered page before browser locale preferences are applied.
 *
 * @param json - Non-executable, application-generated hydration data.
 * @returns The validated page snapshot.
 * @throws {Error} If the JSON or page structure is invalid.
 */
export function parsePage(json: string): DocumentationPage {
    const value: unknown = JSON.parse(json);
    if (
        !isRecord(value) ||
        typeof value["base"] !== "string" ||
        !Array.isArray(value["repositories"]) ||
        !value["repositories"].every(isRepository) ||
        typeof value["route"] !== "string" ||
        !Array.isArray(value["documents"]) ||
        !value["documents"].every(isDocument) ||
        !(value["article"] === null || isArticle(value["article"]))
    ) {
        throw new Error("Invalid documentation page snapshot.");
    }
    return {
        base: value["base"],
        route: value["route"],
        repositories: value["repositories"],
        documents: value["documents"],
        article: value["article"],
    };
}
