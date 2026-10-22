/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { contentRoute, type DocumentationCatalogue } from "../content/catalogue";
import { assetContentSecurityPolicy, loadAsset } from "../content/assets";
import { pageContentSecurityPolicy } from "./output";

/**
 * Publishes only inventoried, sanitized assets under their repository routes and writes response policies.
 *
 * @param catalogues - Isolated source inventories.
 * @param directory - Candidate static output directory.
 * @returns The number of emitted supporting assets.
 * @rejects If an asset is unsafe or cannot be written.
 */
export async function publishAssets(catalogues: readonly DocumentationCatalogue[], directory: string): Promise<number> {
    const base = catalogues[0]?.base ?? "/";
    let headers = `${base}*\n  Content-Security-Policy: ${pageContentSecurityPolicy}\n  X-Content-Type-Options: nosniff\n`;
    let count = 0;
    for (const catalogue of catalogues) {
        for (const path of catalogue.assets) {
            const asset = await loadAsset(catalogue.root, path);
            const route = contentRoute(path, catalogue.repository, catalogue.base);
            const output = resolve(directory, decodeURIComponent(route.slice(catalogue.base.length)));
            await mkdir(dirname(output), { recursive: true });
            await writeFile(output, asset.bytes);
            if (path.toLowerCase().endsWith(".svg")) {
                headers += `${route}\n  Content-Security-Policy: ${assetContentSecurityPolicy}\n`;
            }
            count += 1;
        }
    }
    await writeFile(resolve(directory, "_headers"), headers);
    return count;
}
