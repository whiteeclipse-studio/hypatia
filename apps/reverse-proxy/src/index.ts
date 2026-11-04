/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

const organization = "whiteeclipse-studio";
const origin = "https://whiteeclipse.dev";
const status = { preflight: 204, invalid: 400, method: 405, upstream: 502 };
const validators = ["If-None-Match", "If-Modified-Since"];
const responseMetadata = ["Content-Type", "ETag", "Last-Modified"];

/**
 * Creates response headers for browser downloads and conditional requests.
 *
 * @returns Fresh headers allowing the documentation website to read archives.
 */
function responseHeaders(): Headers {
    return new Headers({
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": validators.join(", "),
        "Access-Control-Expose-Headers": "ETag, Last-Modified",
        "Cache-Control": "no-cache",
    });
}

/**
 * Resolves a repository archive filename with a required .tgz extension.
 *
 * @param request The incoming archive request.
 * @returns The fixed-organization GitHub URL, or null for an invalid key.
 */
function archiveUrl(request: Request): string | null {
    const path = new URL(request.url).pathname;
    const extension = ".tgz";
    if (!path.endsWith(extension)) {
        return null;
    }
    const repository = path.slice(1, -extension.length);
    if (!/^[A-Za-z0-9_.-]{1,100}$/.test(repository) || repository === "." || repository === "..") {
        return null;
    }
    return `https://github.com/${organization}/${repository}/releases/latest/download/${repository}.tgz`;
}

/**
 * Follows GitHub redirects on the server and streams the final response.
 *
 * @param request The browser request containing optional HTTP validators.
 * @param url The validated upstream archive URL.
 * @param headers The browser-facing response headers.
 * @returns Archive bytes, an upstream status, or a CORS-readable gateway error.
 */
async function proxyArchive(request: Request, url: string, headers: Headers): Promise<Response> {
    const upstreamHeaders = new Headers();
    for (const name of validators) {
        const value = request.headers.get(name);
        if (value !== null) {
            upstreamHeaders.set(name, value);
        }
    }
    try {
        const upstream = await fetch(url, { headers: upstreamHeaders, redirect: "follow", cache: "no-store" });
        const forwardedHeaders = new Headers(headers);
        for (const name of responseMetadata) {
            const value = upstream.headers.get(name);
            if (value !== null) {
                forwardedHeaders.set(name, value);
            }
        }
        return new Response(upstream.body, { status: upstream.status, headers: forwardedHeaders });
    } catch {
        return new Response("Archive download failed", { status: status.upstream, headers });
    }
}

export default {
    /**
     * Handles repository archive downloads and their CORS preflight requests.
     *
     * @param request The incoming Worker request.
     * @returns A streamed archive or a descriptive HTTP error.
     */
    async fetch(request: Request): Promise<Response> {
        const headers = responseHeaders();
        const url = archiveUrl(request);
        if (url === null) {
            return new Response("Invalid repository", { status: status.invalid, headers });
        }
        if (request.method === "OPTIONS") {
            return new Response(null, { status: status.preflight, headers });
        }
        if (request.method !== "GET") {
            headers.set("Allow", "GET, OPTIONS");
            return new Response("Method not allowed", { status: status.method, headers });
        }
        return proxyArchive(request, url, headers);
    },
};
