/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createCatalogue } from "../catalogue/index.ts";
import { createSession } from "../session/index.ts";

const catalogue = createCatalogue([
    { locale: "en", namespace: "common", messages: { title: "Hello" } },
    { locale: "fr", namespace: "common", messages: { title: "Bonjour" } },
    { locale: "ja", namespace: "common", messages: { title: "こんにちは" } },
]);
const storage = { getItem: vi.fn<Storage["getItem"]>() };

beforeEach(() => {
    vi.resetModules();
    storage.getItem.mockReset().mockReturnValue(null);
    vi.stubGlobal("window", { localStorage: storage, navigator: { languages: ["ja"], language: "ja" } });
});

afterEach(() => {
    vi.unstubAllGlobals();
});

it("exports a configured instance without initializing or reading browser preferences at import time", async () => {
    const { i18n } = await import("./initialize-browser.ts");

    expect(i18n.isInitialized).toBeFalsy();
    expect(i18n.options.load).toBe("currentOnly");
    expect(i18n.options.postProcess).toEqual(["whiteeclipse-requested-key"]);
    expect(storage.getItem).not.toHaveBeenCalled();
});

it("initializes the exported instance from a supported saved preference before navigator preferences", async () => {
    storage.getItem.mockReturnValue("fr-ca");
    const { i18n, initializeBrowser } = await import("./initialize-browser.ts");
    const session = await initializeBrowser(catalogue);

    expect(session).toBe(i18n);
    expect(session.language).toBe("fr-CA");
    expect(session.t("common:title")).toBe("Bonjour");
    expect(session.t("common:missing", { defaultValue: "Ignored" })).toBe("common:missing");
    expect(storage.getItem).toHaveBeenCalledWith("@whiteeclipse/locale");
});

it.each([null, "es-MX", "not_a_locale"])("uses navigator preferences when the saved preference is %s", async saved => {
    storage.getItem.mockReturnValue(saved);
    const { initializeBrowser } = await import("./initialize-browser.ts");

    const session = await initializeBrowser(catalogue);

    expect(session.language).toBe("ja");
    expect(session.t("common:title")).toBe("こんにちは");
});

it("continues initializing when saved preferences cannot be read", async () => {
    storage.getItem.mockImplementation(() => {
        throw new Error("Storage blocked");
    });
    const { initializeBrowser } = await import("./initialize-browser.ts");

    const session = await initializeBrowser(catalogue);

    expect(session.language).toBe("ja");
});

it("uses English when no available preference or English resources exist", async () => {
    const { initializeBrowser } = await import("./initialize-browser.ts");
    const frenchOnly = createCatalogue([{ locale: "fr", namespace: "common", messages: { title: "Bonjour" } }]);

    const session = await initializeBrowser(frenchOnly);

    expect(session.language).toBe("en");
    expect(session.t("common:title")).toBe("common:title");
});

it("uses the generated locale without reading preferences, even when that locale has no resources", async () => {
    const { initializeBrowser } = await import("./initialize-browser.ts");

    const session = await initializeBrowser(catalogue, "de-at");

    expect(session.language).toBe("de-AT");
    expect(session.t("common:title")).toBe("Hello");
    expect(storage.getItem).not.toHaveBeenCalled();
});

it("rejects malformed explicit locales instead of replacing the generated locale with preferences", async () => {
    const { i18n, initializeBrowser } = await import("./initialize-browser.ts");

    await expect(initializeBrowser(catalogue, "not_a_locale")).rejects.toThrow(TypeError);
    expect(i18n.isInitialized).toBeFalsy();
    expect(storage.getItem).not.toHaveBeenCalled();
});

it("supports runtime changes without affecting independent server sessions or the catalogue", async () => {
    const { initializeBrowser } = await import("./initialize-browser.ts");
    const browser = await initializeBrowser(catalogue);
    const server = await createSession(catalogue, "fr");

    await browser.changeLanguage("en");
    browser.addResource("fr", "common", "title", "Changed");

    expect(browser.t("common:title")).toBe("Hello");
    expect(server.language).toBe("fr");
    expect(server.t("common:title")).toBe("Bonjour");
    expect(catalogue["fr"]?.["common"]?.["title"]).toBe("Bonjour");
});

it("imports safely without browser globals and rejects browser initialization on the server", async () => {
    vi.stubGlobal("window", undefined);
    vi.stubGlobal("navigator", undefined);
    const { i18n, initializeBrowser } = await import("./initialize-browser.ts");

    await expect(initializeBrowser(catalogue)).rejects.toThrow("Use createSession");
    expect(i18n.isInitialized).toBeFalsy();
    expect(storage.getItem).not.toHaveBeenCalled();
});
