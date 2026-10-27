/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import {
    createContext,
    Suspense,
    useContext,
    useEffect,
    useMemo,
    useState,
    useSyncExternalStore,
    type ReactNode,
    type ReactElement,
} from "react";
import { I18nextProvider, Trans as ReactTrans, useTranslation as useReactTranslation } from "react-i18next";
import type { i18n as I18nInstance } from "i18next";
import { applyBrowserLocale } from "./browser";
import { i18n, initialInstance, requireInitialized } from "./runtime";

/** The live instance and the snapshot used for each component's initial hydration render. */
interface HydrationInstances {
    instance: I18nInstance;
    initial: I18nInstance;
}

const HydrationContext = createContext<HydrationInstances | null>(null);

/**
 * Uses the generated locale during this component's hydration, then subscribes to live translations.
 *
 * @param ns - Requested namespace or namespaces.
 * @param options - react-i18next hook options.
 * @returns The upstream hook result bound to the hydration-appropriate instance.
 */
export const useTranslation: typeof useReactTranslation = (ns, options) => {
    const instance = useHydratedInstance(options?.i18n);
    return useReactTranslation(ns, { ...options, i18n: instance });
};

/**
 * Keeps rich-text translations consistent with delayed hydration and subsequent language changes.
 *
 * @param props - react-i18next Trans props.
 * @returns The translated React content.
 */
export const Trans: typeof ReactTrans = props => {
    const instance = useHydratedInstance(props.i18n);
    const { t } = useReactTranslation(props.ns, { i18n: instance });
    return <ReactTrans {...props} i18n={instance} t={props.t ?? t} />;
};

/**
 * Chooses a stable server snapshot until React has hydrated this particular consumer.
 *
 * @param explicit - An optional explicitly requested instance.
 * @returns The initial snapshot during hydration, otherwise the live instance.
 */
function useHydratedInstance(explicit?: I18nInstance): I18nInstance {
    const context = useContext(HydrationContext);
    const hydrated = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
    const live = explicit ?? context?.instance ?? i18n;
    return !hydrated && context?.instance === live ? context.initial : live;
}

/**
 * Supplies a stable subscription; React checks the client snapshot after hydration automatically.
 *
 * @returns An empty unsubscribe function.
 */
function subscribeHydration(): () => void {
    return unsubscribeHydration;
}

/** Releases the no-op hydration subscription. */
function unsubscribeHydration(): void {
    /* No external store is needed for React's hydration state. */
}

/**
 * Identifies ordinary client rendering after a component has hydrated.
 *
 * @returns True for the live client snapshot.
 */
function clientSnapshot(): boolean {
    return true;
}

/**
 * Preserves the generated locale on the server and during the first hydration render.
 *
 * @returns False until this consumer has hydrated.
 */
function serverSnapshot(): boolean {
    return false;
}

/** React integration for a browser session or independent server render. */
export interface I18nProviderProps {
    children: ReactNode;
    instance?: I18nInstance;
    fallback?: ReactNode;
    /** Apply browser preferences after mounting; delayed consumers retain their hydration snapshot. Defaults to true. */
    applyBrowserPreferences?: boolean;
}

/**
 * Provides an instance and a Suspense boundary for initialization and pending translations.
 *
 * @param props - Instance, children, loading UI, and post-hydration preference behaviour.
 * @returns A localized subtree with a loading boundary.
 */
export function I18nProvider(props: I18nProviderProps): ReactElement {
    return (
        <Suspense fallback={props.fallback ?? null}>
            <InitializedProvider {...props} />
        </Suspense>
    );
}

/**
 * Defers browser selection until React has committed the initially rendered locale.
 *
 * @param props - Provider configuration.
 * @returns The instance-bound subtree.
 * @throws {Error | Promise<unknown>} Pending initialization for Suspense or initialization/language-change failures.
 */
function InitializedProvider(props: I18nProviderProps): ReactElement {
    const { children, instance = i18n, applyBrowserPreferences = true } = props;
    requireInitialized(instance);
    const instances = useMemo(() => {
        return { instance, initial: initialInstance(instance) };
    }, [instance]);
    const [error, setError] = useState<unknown>();
    useEffect(() => {
        if (applyBrowserPreferences) {
            applyBrowserLocale(instance).catch(setError);
        }
    }, [instance, applyBrowserPreferences]);
    if (error !== undefined) {
        throw new Error("Failed to apply browser locale", { cause: error });
    }
    return (
        <HydrationContext.Provider value={instances}>
            <I18nextProvider i18n={instance}>{children}</I18nextProvider>
        </HydrationContext.Provider>
    );
}
