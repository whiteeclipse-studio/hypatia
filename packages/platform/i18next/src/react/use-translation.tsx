/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { Trans as ReactTrans, useTranslation as useReactTranslation } from "react-i18next";
import { useLocale } from "./locale-context.ts";

/**
 * Binds translation reads to this consumer's hydration locale and actions to the live session.
 *
 * @param ns - Requested namespace or namespaces.
 * @param options - Upstream translation options, including an optional explicit locale.
 * @returns The upstream translation result with the original, stable session instance.
 */
export const useTranslation: typeof useReactTranslation = (ns, options) => {
    const { locale, session } = useLocale();
    const instance = options?.i18n ?? session;
    const result = useReactTranslation(ns, {
        ...options,
        i18n: instance,
        lng: options?.lng ?? (instance === session ? locale : instance.language),
    });

    const tuple: [typeof result.t, typeof instance, boolean] = [result.t, instance, result.ready];
    return Object.assign(tuple, {
        t: result.t,
        i18n: instance,
        ready: result.ready,
    });
};

/**
 * Renders rich translations using the same locale snapshot as translation hooks.
 *
 * @param props - Upstream Trans inputs.
 * @returns The translated React content.
 */
export const Trans: typeof ReactTrans = props => {
    const { t, i18n } = useTranslation(props.ns, { ...(props.i18n === undefined ? {} : { i18n: props.i18n }) });
    return <ReactTrans {...props} i18n={i18n} t={props.t ?? t} />;
};
