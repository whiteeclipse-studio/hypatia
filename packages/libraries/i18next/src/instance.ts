/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { createInstance, type InitOptions, type i18n } from "i18next";
import { initReactI18next } from "react-i18next";
import resources from "virtual:whiteeclipse-i18next";
import { initializeLanguage } from "./language";

/** Application options with the request locale reference required for SSR. */
export interface I18nextConfiguration extends InitOptions {
    acceptLanguage?: string;
}

/**
 * Applies the RFC-0003 defaults while initializing a React-compatible instance.
 *
 * @param instance - Instance to configure without changing any other instance.
 * @param settings - Application-specific namespace, language, and request header settings.
 * @returns The initialized instance.
 * @rejects If initialization fails.
 */
async function initialize(instance: i18n, settings: I18nextConfiguration): Promise<i18n> {
    const { acceptLanguage, ...options } = settings;
    const messages = structuredClone(options.resources ?? resources);
    const namespaces = [...new Set(Object.values(messages).flatMap(language => Object.keys(language)))];
    instance.use(initReactI18next);
    await instance.init({
        ...options,
        resources: messages,
        ns: options.ns ?? namespaces,
        defaultNS:
            options.defaultNS ??
            (namespaces.includes("translation") ? "translation" : (namespaces[0] ?? "translation")),
        lng: options.lng ?? "en",
        supportedLngs: options.supportedLngs ?? Object.keys(messages),
        fallbackLng: "en",
        load: "all",
        returnNull: false,
        returnEmptyString: false,
        interpolation: { ...options.interpolation, escapeValue: false },
        initAsync: false,
    });
    await initializeLanguage(instance, options.lng, acceptLanguage);
    return instance;
}

/**
 * Creates an isolated configured instance for an SSR request or independent React application.
 * This remains exploratory implementation under draft RFC-0003.
 *
 * @param options - Optional application configuration, with RFC fallback behaviour retained.
 * @returns The instance after initialization has completed.
 * @rejects If i18next initialization fails.
 */
export async function configureI18next(options: I18nextConfiguration = {}): Promise<i18n> {
    return initialize(createInstance(), options);
}

const instance: i18n = createInstance();
const initialization: Promise<i18n> = initialize(instance, {});

export { instance as i18next, initialization as ready };
