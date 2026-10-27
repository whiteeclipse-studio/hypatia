/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createCatalogue } from "../catalogue/index.ts";
import { selectLocale } from "./select-locale.ts";
import { createSession } from "../session/index.ts";
import { localeStorageKey, readBrowserPreferences, rememberLocale } from "./browser-preferences.ts";

const storage = {
    getItem: vi.fn<Storage["getItem"]>(),
    setItem: vi.fn<Storage["setItem"]>(),
};

beforeEach(() => {
    storage.getItem.mockReset().mockReturnValue(null);
    storage.setItem.mockReset();

    vi.stubGlobal("window", {
        navigator: { languages: ["ja", "fr"], language: "ja" },
        localStorage: storage,
    });
});

afterEach(() => {
    vi.unstubAllGlobals();
});

it("reads the saved preference before ordered browser languages", () => {
    storage.getItem.mockReturnValue("fr-CA");

    expect(readBrowserPreferences()).toEqual(["fr-CA", "ja", "fr"]);
    expect(storage.getItem).toHaveBeenCalledWith("@whiteeclipse/locale");
    expect(localeStorageKey).toBe("@whiteeclipse/locale");
});

it("uses browser languages when no preference is saved", () => {
    expect(readBrowserPreferences()).toEqual(["ja", "fr"]);
});

it("uses the primary browser language when the language list is empty", () => {
    Object.defineProperty(window.navigator, "languages", { value: [], configurable: true });

    expect(readBrowserPreferences()).toEqual(["ja"]);
});

it("returns a separate preference list without exposing navigator's array to mutation", () => {
    const preferences = readBrowserPreferences();
    preferences.reverse();

    expect(window.navigator.languages).toEqual(["ja", "fr"]);
    expect(readBrowserPreferences()).toEqual(["ja", "fr"]);
});

it("leaves malformed and unsupported saved values to the existing selection policy", () => {
    const catalogue = createCatalogue([{ locale: "ja", namespace: "common", messages: { title: "こんにちは" } }]);
    storage.getItem.mockReturnValue("es-MX");

    expect(readBrowserPreferences()[0]).toBe("es-MX");
    expect(selectLocale(readBrowserPreferences(), catalogue)).toBe("ja");

    storage.getItem.mockReturnValue("not_a_locale");

    expect(readBrowserPreferences()[0]).toBe("not_a_locale");
    expect(selectLocale(readBrowserPreferences(), catalogue)).toBe("ja");
});

it("keeps browser languages available when getItem throws", () => {
    storage.getItem.mockImplementation(() => {
        throw new Error("Storage read blocked");
    });

    expect(readBrowserPreferences()).toEqual(["ja", "fr"]);
});

it("handles a browser that denies access to the localStorage property itself", () => {
    Object.defineProperty(window, "localStorage", {
        configurable: true,
        /**
         * Models storage denied before a method can be called.
         *
         * @throws {Error} For every storage access.
         */
        get(): never {
            throw new Error("Storage access blocked");
        },
    });

    expect(readBrowserPreferences()).toEqual(["ja", "fr"]);
    expect(() => {
        rememberLocale("fr");
    }).not.toThrow();
});

it("writes explicit choices to the required storage key", () => {
    rememberLocale("fr-CA");

    expect(storage.setItem).toHaveBeenCalledWith("@whiteeclipse/locale", "fr-CA");
});

it("restores an explicit choice when a new session is initialized from browser preferences", async () => {
    const saved = new Map<string, string>();
    storage.getItem.mockImplementation(key => saved.get(key) ?? null);
    storage.setItem.mockImplementation((key, value) => {
        saved.set(key, value);
    });
    const catalogue = createCatalogue([
        { locale: "fr", namespace: "common", messages: { title: "Bonjour" } },
        { locale: "ja", namespace: "common", messages: { title: "こんにちは" } },
    ]);
    const first = await createSession(catalogue, selectLocale(readBrowserPreferences(), catalogue));

    expect(first.language).toBe("ja");

    await first.changeLanguage(selectLocale(["fr-ca"], catalogue));
    rememberLocale(first.language);
    const restored = await createSession(catalogue, selectLocale(readBrowserPreferences(), catalogue));

    expect(restored.language).toBe("fr-CA");
    expect(restored.t("common:title")).toBe("Bonjour");
});

it("retains the active session language when setItem throws", async () => {
    storage.setItem.mockImplementation(() => {
        throw new Error("Storage write blocked");
    });
    const catalogue = createCatalogue([
        { locale: "en", namespace: "common", messages: { title: "Hello" } },
        { locale: "ja", namespace: "common", messages: { title: "こんにちは" } },
    ]);
    const session = await createSession(catalogue);

    await session.changeLanguage("ja");

    expect(() => {
        rememberLocale(session.language);
    }).not.toThrow();
    expect(session.language).toBe("ja");
    expect(session.t("common:title")).toBe("こんにちは");
});

it("works outside the browser without requiring window, storage, or navigator", () => {
    vi.stubGlobal("window", undefined);
    vi.stubGlobal("navigator", undefined);

    expect(readBrowserPreferences()).toEqual([]);
    expect(() => {
        rememberLocale("ja");
    }).not.toThrow();
    expect(selectLocale(readBrowserPreferences(), createCatalogue([]))).toBe("en");
});
