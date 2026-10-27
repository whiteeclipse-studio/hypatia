/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { CatalogueEntry, Messages, MessageValue, TranslationCatalogue } from "./types.ts";
import { canonicalLocale } from "./canonical-locale.ts";

/**
 * Collects independent translation sources into an owned, deeply immutable catalogue.
 *
 * @param entries - Parsed message groups identified by locale and namespace.
 * @returns A catalogue with canonical locale names. An empty catalogue is valid.
 * @throws {TypeError} For invalid locales, empty namespace names, unsupported messages, or cycles.
 * @throws {Error} For duplicate locale–namespace pairs or a locale with no message strings.
 */
export function createCatalogue(entries: readonly CatalogueEntry[]): TranslationCatalogue {
    const locales = new Map<string, Map<string, Messages>>();

    for (const entry of entries) {
        const locale = canonicalLocale(entry.locale);
        if (entry.namespace.length === 0) {
            throw new TypeError(`Empty translation namespace for locale "${locale}".`);
        }

        const namespaces = locales.get(locale) ?? new Map<string, Messages>();
        if (namespaces.has(entry.namespace)) {
            throw new Error(`Duplicate translation namespace "${entry.namespace}" for locale "${locale}".`);
        }

        namespaces.set(entry.namespace, copyMessages(entry.messages));
        locales.set(locale, namespaces);
    }

    const catalogue = new Map<string, Readonly<Record<string, Messages>>>();
    for (const [locale, namespaces] of locales) {
        if (![...namespaces.values()].some(containsMessage)) {
            throw new Error(`Locale "${locale}" contains no messages.`);
        }

        catalogue.set(locale, Object.freeze(Object.fromEntries(namespaces)));
    }

    return Object.freeze(Object.fromEntries(catalogue));
}

/**
 * Validates a namespace root and copies its entries without retaining mutable source objects.
 *
 * @param messages - Parsed source data, independent of its file format.
 * @returns An owned, frozen message mapping.
 * @throws {TypeError} For non-mapping roots, invalid nested values, or cycles.
 */
function copyMessages(messages: unknown): Messages {
    if (!isMapping(messages)) {
        throw new TypeError("Namespace messages must be a plain mapping.");
    }

    return copyMapping(messages, new WeakSet([messages]));
}

/**
 * Copies a mapping while preserving keys such as __proto__ as ordinary message entries.
 *
 * @param messages - Mapping being copied.
 * @param ancestors - Containers on the current traversal path.
 * @returns A frozen mapping whose values are validated, independent copies.
 * @throws {TypeError} For invalid nested values or cycles.
 */
function copyMapping(messages: Readonly<Record<string, unknown>>, ancestors: WeakSet<object>): Messages {
    const copied = new Map<string, MessageValue>();
    for (const [key, value] of Object.entries(messages)) {
        copied.set(key, copyValue(value, ancestors));
    }

    return Object.freeze(Object.fromEntries(copied));
}

/**
 * Copies nested message groups and lists, rejecting values that cannot represent message data.
 *
 * @param value - Source message value.
 * @param ancestors - Containers on the current traversal path, allowing non-cyclic shared references.
 * @returns The string or a deeply frozen copy of the container.
 * @throws {TypeError} For unsupported values, non-plain objects, or cycles.
 */
function copyValue(value: unknown, ancestors: WeakSet<object>): MessageValue {
    if (typeof value === "string") {
        return value;
    }

    if (typeof value !== "object" || value === null) {
        throw new TypeError("Messages must contain strings, plain mappings, or lists.");
    }

    if (ancestors.has(value)) {
        throw new TypeError("Messages must not contain circular references.");
    }

    ancestors.add(value);
    try {
        if (Array.isArray(value)) {
            const items: readonly unknown[] = value;
            return Object.freeze(items.map(item => copyValue(item, ancestors)));
        }

        if (isMapping(value)) {
            return copyMapping(value, ancestors);
        }

        throw new TypeError("Messages must contain strings, plain mappings, or lists.");
    } finally {
        ancestors.delete(value);
    }
}

/**
 * Recognizes plain data mappings rather than class instances or collections.
 *
 * @param value - Source value to inspect.
 * @returns Whether the value is a plain mapping, including null-prototype mappings.
 */
function isMapping(value: unknown): value is Record<string, unknown> {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return false;
    }

    const prototype: unknown = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

/**
 * Counts declared string messages, including empty strings; empty containers do not count.
 *
 * @param value - Validated message value or namespace mapping.
 * @returns Whether at least one string entry exists anywhere below the value.
 */
function containsMessage(value: MessageValue): boolean {
    if (typeof value === "string") {
        return true;
    }

    return Object.values<MessageValue>(value).some(containsMessage);
}
