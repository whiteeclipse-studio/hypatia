/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/** One message, a nested message group, or an ordered list of messages. */
export type MessageValue = string | Messages | readonly MessageValue[];

/** Read-only message entries within a namespace. */
export interface Messages {
    readonly [key: string]: MessageValue;
}

/** One source's contribution; the catalogue validates its parsed message data. */
export interface CatalogueEntry {
    readonly locale: string;
    readonly namespace: string;
    readonly messages: unknown;
}

/** A serializable, immutable snapshot indexed by canonical locale and namespace. */
export type TranslationCatalogue = Readonly<Record<string, Readonly<Record<string, Messages>>>>;
