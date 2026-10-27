// @vitest-environment happy-dom
/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { Storage } from "happy-dom";
import { act, Suspense, use, useEffect } from "react";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createCatalogue } from "../catalogue/index.ts";
import { createSession } from "../session/index.ts";
import { localeStorageKey, readBrowserPreferences, selectLocale } from "../preferences/index.ts";
import { I18nProvider } from "./provider.tsx";
import { useLocale } from "./locale-context.ts";
import { Trans, useTranslation } from "./use-translation.tsx";

const catalogue = createCatalogue([
    { locale: "en", namespace: "common", messages: { title: "Hello", rich: "Hello <strong>friend</strong>" } },
    { locale: "fr", namespace: "common", messages: { title: "Bonjour", rich: "Bonjour <strong>ami</strong>" } },
    { locale: "ja", namespace: "common", messages: { title: "こんにちは", rich: "こんにちは <strong>友達</strong>" } },
]);
let container: HTMLDivElement;
let root: Root | undefined;

beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal("localStorage", new Storage());
    vi.spyOn(window.navigator, "languages", "get").mockReturnValue(["ja"]);
    container = document.createElement("div");
    document.body.append(container);
});

afterEach(async () => {
    await act(async () => {
        await Promise.resolve();
        root?.unmount();
    });
    root = undefined;
    container.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

it("renders independent server sessions without reading browser preferences", async () => {
    const french = await createSession(catalogue, "fr");
    const japanese = await createSession(catalogue, "ja");
    const storage = vi.spyOn(window.localStorage, "getItem");
    /**
     * Renders the test consumer.
     *
     * @returns Localized test content.
     */
    const Reader = () => {
        const { t } = useTranslation("common");
        return <p>{t("title")}</p>;
    };

    const first = renderToString(
        <I18nProvider session={french} catalogue={catalogue}>
            <Reader />
        </I18nProvider>,
    );
    const second = renderToString(
        <I18nProvider session={japanese} catalogue={catalogue}>
            <Reader />
        </I18nProvider>,
    );

    expect(first).toContain("Bonjour");
    expect(second).toContain("こんにちは");
    expect(storage).not.toHaveBeenCalled();
    expect(french.language).toBe("fr");
});

it("shows the loading fallback until the supplied initialization promise resolves", async () => {
    const pending = Promise.withResolvers<Awaited<ReturnType<typeof createSession>>>();
    /**
     * Renders the test consumer.
     *
     * @returns Localized test content.
     */
    const Reader = () => {
        const { t } = useTranslation("common");
        return <p>{t("title")}</p>;
    };
    root = createRoot(container);

    await act(async () => {
        await Promise.resolve();
        root?.render(
            <I18nProvider
                session={pending.promise}
                catalogue={catalogue}
                fallback="Loading"
                applyBrowserPreferences={false}
            >
                <Reader />
            </I18nProvider>,
        );
    });
    expect(container.textContent).toBe("Loading");

    await act(async () => {
        await Promise.resolve();
        pending.resolve(await createSession(catalogue, "fr"));
    });
    expect(container.textContent).toBe("Bonjour");
});

it("uses saved preferences during client-only initialization and persists explicit choices", async () => {
    window.localStorage.setItem(localeStorageKey, "fr");
    const session = await createSession(catalogue, selectLocale(readBrowserPreferences(), catalogue));
    let choose: ((locale: string) => Promise<void>) | undefined;
    /**
     * Renders the test consumer.
     *
     * @returns Localized test content.
     */
    const Reader = () => {
        const { t, i18n } = useTranslation("common");
        const { locale, changeLocale } = useLocale();
        choose = changeLocale;
        expect(i18n).toBe(session);
        return <p lang={locale}>{t("title")}</p>;
    };
    root = createRoot(container);
    await act(async () => {
        await Promise.resolve();
        root?.render(
            <I18nProvider session={session} catalogue={catalogue}>
                <Reader />
            </I18nProvider>,
        );
    });
    expect(container.textContent).toBe("Bonjour");

    await act(async () => {
        await Promise.resolve();
        await choose?.("ja");
    });
    expect(container.textContent).toBe("こんにちは");
    expect(container.querySelector("p")?.lang).toBe("ja");
    expect(window.localStorage.getItem(localeStorageKey)).toBe("ja");
});

it("keeps retained translation-hook instances as live command targets", async () => {
    const session = await createSession(catalogue, "fr");
    let retained: typeof session | undefined;
    /**
     * Renders the test consumer.
     *
     * @returns Localized test content.
     */
    const Reader = () => {
        const { t, i18n } = useTranslation("common");
        useEffect(() => {
            retained = i18n;
        }, []);
        return <p>{t("title")}</p>;
    };
    root = createRoot(container);
    await act(async () => {
        await Promise.resolve();
        root?.render(
            <I18nProvider session={session} catalogue={catalogue}>
                <Reader />
            </I18nProvider>,
        );
    });
    expect(container.textContent).toBe("こんにちは");
    expect(retained).toBe(session);

    await act(async () => {
        await Promise.resolve();
        await retained?.changeLanguage("en");
    });
    expect(container.textContent).toBe("Hello");
    expect(session.language).toBe("en");
});

it("preserves the HTML locale for delayed consumers before switching to browser preferences", async () => {
    const session = await createSession(catalogue, "fr");
    const pending = Promise.withResolvers<undefined>();
    let delay = false;
    const renders: string[] = [];
    const errors: unknown[] = [];
    /**
     * Renders the test consumer.
     *
     * @returns Localized test content.
     */
    const Reader = () => {
        if (delay) {
            use(pending.promise);
        }
        const { locale } = useLocale();
        const { t } = useTranslation("common");
        renders.push(locale);
        return (
            <p lang={locale}>
                {t("title")}
                <Trans ns="common" i18nKey="rich" />
            </p>
        );
    };
    const tree = (
        <I18nProvider session={session} catalogue={catalogue} initialLocale="fr">
            <Suspense fallback="Waiting">
                <Reader />
            </Suspense>
        </I18nProvider>
    );
    container.innerHTML = renderToString(tree);
    expect(container.textContent).toBe("BonjourBonjour ami");
    renders.length = 0;
    delay = true;

    await act(async () => {
        await Promise.resolve();
        root = hydrateRoot(container, tree, {
            /**
             * Records hydration failures.
             *
             * @param error - The hydration error.
             */
            onRecoverableError(error) {
                errors.push(error);
            },
        });
    });
    expect(session.language).toBe("ja");
    expect(container.textContent).toBe("BonjourBonjour ami");

    await act(async () => {
        await Promise.resolve();
        pending.resolve(undefined);
    });
    expect(renders[0]).toBe("fr");
    expect(renders.at(-1)).toBe("ja");
    expect(container.textContent).toBe("こんにちはこんにちは 友達");
    expect(errors).toEqual([]);
});
