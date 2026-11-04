/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { afterAll, afterEach, expect, spyOn, test } from "bun:test";
import worker from "./index.js";


const download = spyOn(globalThis, "fetch");
afterEach(() => download.mockReset());
afterAll(() => {
    download.mockRestore();
});

test.each(["ryugu", "hypatia", "example.docs-v2_1"])("streams the latest %s archive", async repository => {
    const bytes = new Uint8Array([0x1f, 0x8b, 0, 0xff]);
    const upstream = new Response(bytes, { headers: { "Content-Type": "application/octet-stream" } });
    download.mockResolvedValue(upstream);

    const response = await worker.fetch(new Request(`https://proxy.example/${repository}`));

    expect(download).toHaveBeenCalledWith(
        `https://github.com/whiteeclipse-studio/${repository}/releases/latest/download/${repository}.tgz`,
        { headers: new Headers(), redirect: "follow", cache: "no-store" },
    );
    expect(response.status).toBe(200);
    expect(response.body).toBe(upstream.body);
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes);
    expect(response.headers.get("Content-Type")).toBe("application/octet-stream");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://whiteeclipse.dev");
    expect(response.headers.has("Content-Encoding")).toBe(false);
    expect(response.headers.has("Location")).toBe(false);
});

test("preflights conditional requests without contacting GitHub", async () => {
    const response = await worker.fetch(
        new Request("https://proxy.example/ryugu", {
            method: "OPTIONS",
            headers: {
                Origin: "https://whiteeclipse.dev",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "if-none-match, if-modified-since",
            },
        }),
    );

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://whiteeclipse.dev");
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe("GET, OPTIONS");
    expect(response.headers.get("Access-Control-Allow-Headers")).toBe("If-None-Match, If-Modified-Since");
    expect(download).not.toHaveBeenCalled();
});

test("forwards HTTP validators without forwarding browser cookies or authorization", async () => {
    const modified = "Wed, 04 Nov 2026 10:00:00 GMT";
    download.mockResolvedValue(
        new Response(null, {
            status: 304,
            headers: { ETag: '"fixture"', "Last-Modified": modified },
        }),
    );

    const response = await worker.fetch(
        new Request("https://proxy.example/ryugu", {
            headers: {
                "If-None-Match": '"fixture"',
                "If-Modified-Since": modified,
                Cookie: "fixture=value",
                Authorization: "Bearer synthetic-fixture",
            },
        }),
    );

    expect(download).toHaveBeenCalledWith(expect.any(String), {
        headers: new Headers({ "If-None-Match": '"fixture"', "If-Modified-Since": modified }),
        redirect: "follow",
        cache: "no-store",
    });
    expect(response.status).toBe(304);
    expect(response.body).toBeNull();
    expect(response.headers.get("ETag")).toBe('"fixture"');
    expect(response.headers.get("Last-Modified")).toBe(modified);
    expect(response.headers.get("Access-Control-Expose-Headers")).toBe("ETag, Last-Modified");
    expect(response.headers.get("Cache-Control")).toBe("no-cache");
});

test.each([
    "/",
    "/..",
    "/%2e%2e",
    "/ryugu/extra",
    "/ryugu/",
    "/whiteeclipse-studio%2Fryugu",
    "/a%3Fb",
    `/${"a".repeat(101)}`,
])("rejects invalid repository path %s without fetching an upstream", async path => {
    const response = await worker.fetch(new Request(`https://proxy.example${path}`));
    expect(response.status).toBe(400);
    expect(download).not.toHaveBeenCalled();
});

test.each(["POST", "PUT", "DELETE", "HEAD"])("rejects %s without fetching an upstream", async method => {
    const response = await worker.fetch(new Request("https://proxy.example/ryugu", { method }));
    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("GET, OPTIONS");
    expect(download).not.toHaveBeenCalled();
});

test.each([404, 429, 500])("preserves upstream HTTP %i with CORS headers", async code => {
    download.mockResolvedValue(new Response("Upstream failure", { status: code }));
    const response = await worker.fetch(new Request("https://proxy.example/ryugu"));
    expect(response.status).toBe(code);
    expect(await response.text()).toBe("Upstream failure");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://whiteeclipse.dev");
});

test("returns a CORS-readable gateway failure when GitHub is unreachable", async () => {
    download.mockRejectedValue(new Error("Synthetic network failure"));
    const response = await worker.fetch(new Request("https://proxy.example/ryugu"));
    expect(response.status).toBe(502);
    expect(await response.text()).toBe("Archive download failed");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://whiteeclipse.dev");
});

test("does not reflect arbitrary origins", async () => {
    download.mockResolvedValue(new Response("fixture"));
    const response = await worker.fetch(
        new Request("https://proxy.example/ryugu", {
            headers: { Origin: "https://other.example" },
        }),
    );
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://whiteeclipse.dev");
});
