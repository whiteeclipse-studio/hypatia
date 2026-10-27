/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { i18n } from "i18next";
import type { TranslationCatalogue } from "../catalogue/index.ts";
import { createConfiguredSession, initializeSession } from "./initialize-session.ts";

/**
 * Creates one independent translation engine for a browser session, server request, or static render.
 *
 * @param catalogue - Validated translations copied into this session's private resource store.
 * @param locale - The locale to apply, normally supplied by language selection; defaults to English.
 * @returns An initialized i18next instance with its own language and resources.
 * @rejects If the locale is invalid or i18next initialization fails.
 */
export async function createSession(catalogue: TranslationCatalogue, locale = "en"): Promise<i18n> {
    return initializeSession(createConfiguredSession(), catalogue, locale);
}
