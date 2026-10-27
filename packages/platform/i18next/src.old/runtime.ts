/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { createInstance, type i18n as I18nInstance, type InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";
import { browserPreferences, persistLocale } from "./browser";
import { headerPreferences, selectLocale } from "./locale";
import { requestedKeyProcessor } from "./missing-key";
import type { I18nOptions } from "./types";

const defaults: InitOptions = {
    lng: "en",
    fallbackLng: fallbackLocales,
    load: "currentOnly",
    defaultNS: "translation",
    interpolation: { escapeValue: false },
    returnNull: false,
    returnEmptyString: false,
    postProcess: [requestedKeyProcessor.name],
    initAsync: false,
    react: { useSuspense: true },
};

/** Configured browser singleton. Supply application resources before rendering; never share across server requests. */
export const i18n: I18nInstance = configuredInstance();

const initialization = new WeakMap<I18nInstance, Promise<I18nInstance>>();
const initializationErrors = new WeakMap<I18nInstance, Error>();
const initialInstances = new WeakMap<I18nInstance, I18nInstance>();

/**
 * Initializes a singleton or explicitly supplied instance with bundled resources.
 *
 * @param options - Resources and optional server or hydration locale inputs.
 * @param instance - The browser singleton by default; supply an independent server instance.
 * @returns The initialized instance.
 * @rejects If i18next initialization fails.
 */
export async function initializeI18n(options: I18nOptions, instance: I18nInstance = i18n): Promise<I18nInstance> {
    initializationErrors.delete(instance);
    initialInstances.delete(instance);
    const locale = initialLocale(options);
    const namespaces = [...new Set(Object.values(options.resources).flatMap(Object.keys))];
    const pending = instance
        .use(initReactI18next)
        .use(requestedKeyProcessor)
        .init({
            ...defaults,
            resources: structuredClone(options.resources),
            lng: locale,
            ns: namespaces,
            defaultNS: namespaces.includes("common") ? "common" : (namespaces[0] ?? "translation"),
        })
        .then(() => instance);
    initialization.set(instance, pending);
    try {
        return await pending;
    } catch (error) {
        initializationErrors.set(instance, new Error("Localization initialization failed", { cause: error }));
        throw error;
    }
}

/**
 * Creates an isolated, initialized instance for a request or independent static render.
 *
 * @param options - Bundled resources and request or explicit locale.
 * @returns An instance whose language and resources are independent of other renders.
 * @rejects If i18next initialization fails.
 */
export async function createI18n(options: I18nOptions): Promise<I18nInstance> {
    return initializeI18n(options, configuredInstance());
}

/**
 * Captures the initial language while sharing this render's resources, including pending namespace loads.
 *
 * @param instance - The initialized live instance.
 * @returns A stable initial-language snapshot for this initialization.
 */
export function initialInstance(instance: I18nInstance): I18nInstance {
    let snapshot = initialInstances.get(instance);
    if (snapshot === undefined) {
        snapshot = instance.cloneInstance({ lng: instance.language, initAsync: false });
        initialInstances.set(instance, snapshot);
    }
    return snapshot;
}

/**
 * Attaches the shared configuration and integrations without starting application initialization.
 *
 * @returns An instance configured for bundled React localization.
 */
function configuredInstance(): I18nInstance {
    return createInstance(defaults).use(initReactI18next).use(requestedKeyProcessor);
}

/**
 * Changes and persists an explicit selection, retaining it if storage writes fail.
 *
 * @param locale - Preferred BCP 47 language; unsupported choices resolve to English.
 * @param instance - Instance to change, defaulting to the browser singleton.
 * @returns Completion of the language change and attempted persistence.
 * @rejects If i18next cannot change language. Storage failures never reject.
 */
export async function setLocale(locale: string, instance: I18nInstance = i18n): Promise<void> {
    const selected = selectLocale([locale], instance.options.resources ?? {});
    await instance.changeLanguage(selected);
    persistLocale(selected);
}

/**
 * Suspends rendering until package-managed or already-started external initialization completes.
 *
 * @param instance - Instance being rendered.
 * @throws {Error | Promise<I18nInstance>} The pending promise for Suspense, an initialization error, or missing setup.
 */
export function requireInitialized(instance: I18nInstance): void {
    const error = initializationErrors.get(instance);
    if (error !== undefined) {
        throw error;
    }
    if (instance.isInitialized) {
        return;
    }
    let pending = initialization.get(instance);
    if (pending === undefined && instance.isInitializing) {
        pending = new Promise(resolve => {
            /** Completes Suspense when externally started i18next initialization finishes. */
            function initialized(): void {
                instance.off("initialized", initialized);
                resolve(instance);
            }
            instance.on("initialized", initialized);
        });
        initialization.set(instance, pending);
    }
    if (pending === undefined) {
        throw new Error("Initialize localization with initializeI18n or createI18n before rendering.");
    }
    // React Suspense requires throwing the initialization promise.
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw pending;
}

/**
 * Selects the rendering locale, keeping explicit hydration inputs ahead of browser preferences.
 *
 * @param options - Initialization context.
 * @returns The initial locale.
 */
function initialLocale(options: I18nOptions): string {
    if (options.initialLocale !== undefined) {
        return selectLocale([options.initialLocale], options.resources);
    }
    if (options.acceptLanguage !== undefined) {
        return selectLocale(headerPreferences(options.acceptLanguage), options.resources);
    }
    return selectLocale(browserPreferences(), options.resources);
}

/**
 * Supplies the exact regional → base → English lookup chain to i18next.
 *
 * @param locale - Active language, when supplied by i18next.
 * @returns Base language followed by English, without duplicate entries.
 */
function fallbackLocales(locale?: string): string[] {
    const base = locale?.split("-")[0] ?? "en";
    return base === "en" ? ["en"] : [base, "en"];
}
