/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { RenderedPage } from "@whiteeclipse/documentation-builder/browser";
import type { WebsitePage } from "./routes.ts";

/**
 * Narrows JSON objects for shape checks without accepting arrays.
 *
 * @param value - Parsed JSON value.
 * @returns Whether this value has named fields.
 */
function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Checks the shape of an application-owned, already-sanitized rendered page.
 *
 * @param value - Parsed static bootstrap content.
 * @returns Whether the content contains the complete rendered-page contract.
 */
function isRenderedPage(value: unknown): value is RenderedPage {
    if (!isObject(value)) {
        return false;
    }
    const strings = ["id", "title", "html", "copyrightAndLicence", "revisions"];
    return (
        strings.every(function isString(key): boolean {
            return typeof value[key] === "string";
        }) && typeof value["revision"] === "number"
    );
}

/**
 * Reads state embedded by the same build that generated the HTML being hydrated.
 *
 * @param text - Application-generated JSON; this is not an artifact import boundary.
 * @returns Shape-checked initial page state.
 * @throws {Error} When the generated bootstrap is corrupt or incomplete.
 */
export function parseBootstrap(text: string): WebsitePage {
    const value: unknown = JSON.parse(text);
    if (
        !isObject(value) ||
        typeof value["pathname"] !== "string" ||
        !(value["projectName"] === null || typeof value["projectName"] === "string") ||
        typeof value["notFound"] !== "boolean" ||
        !(value["page"] === null || isRenderedPage(value["page"]))
    ) {
        throw new Error("Invalid website bootstrap data.");
    }
    return {
        pathname: value["pathname"],
        projectName: value["projectName"],
        page: value["page"],
        notFound: value["notFound"],
    };
}
