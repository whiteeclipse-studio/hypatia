/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { dirname, join, resolve } from "node:path";


const packageRoot = resolve(import.meta.dirname, "..");
const sourceRoot = join(packageRoot, "src");
const outputRoot = join(packageRoot, "dist/obsidian");
const fontPackages = ["inter", "outfit", "jetbrains-mono"];

/**
 * Extract only the shared appearance tokens, excluding Radix component rules.
 *
 * @param source - Shared palette or feedback stylesheet.
 * @returns Native light and dark token declarations.
 */
function appearanceTokens(source: string): string {
    return ["light", "dark"]
        .map(appearance => {
            const selector = `.radix-themes[data-gray-color="sand"]:where(.${appearance}, .${appearance}-theme)`;
            const opening = `${selector} {`;
            const start = source.indexOf(opening);
            const end = source.indexOf("}", start);
            if (start < 0 || end < 0) {
                throw new Error(`Missing shared ${appearance} palette declarations`);
            }
            const declarations = source.slice(start + opening.length, end);
            return `body.theme-${appearance} {${declarations}}`;
        })
        .join("\n");
}

/**
 * Adapt the shared drawing without changing native note height or scrolling.
 *
 * @param source - Shared background stylesheet.
 * @returns Unlayered decoration for native note surfaces.
 * @throws {Error} If the expected shared background layer is absent.
 */
function backgroundStyles(source: string): string {
    const layer = "@layer radix {";
    const start = source.indexOf(layer);
    if (start < 0 || !source.trimEnd().endsWith("}")) {
        throw new Error("Missing shared background layer");
    }
    return source
        .slice(start + layer.length, source.lastIndexOf("}"))
        .replaceAll(".core-ui-background", ':is(.workspace-leaf-content[data-type="markdown"] > .view-content, .print)')
        .replace("min-height: 100vh;", "min-height: 0;");
}

/**
 * Keep the complete notices in the standalone distribution.
 *
 * @param font - Fontsource variable font package name.
 * @returns A CSS comment containing the package's complete licence.
 */
async function fontLicence(font: string): Promise<string> {
    const entry = Bun.resolveSync(`@fontsource-variable/${font}`, packageRoot);
    const licence = await Bun.file(join(dirname(entry), "LICENSE")).text();
    return `/* @fontsource-variable/${font}\n${licence.replaceAll("*/", "* /")}\n*/`;
}

const result = await Bun.build({
    entrypoints: [join(sourceRoot, "obsidian/theme.css")],
    target: "browser",
    plugins: [
        {
            name: "obsidian-foundations",
            setup(build) {
                build.onResolve({ filter: /\.woff2$/ }, async ({ path, resolveDir }) => {
                    const bytes = await Bun.file(resolve(resolveDir, path)).arrayBuffer();
                    return { path: `data:font/woff2;base64,${Buffer.from(bytes).toString("base64")}`, external: true };
                });
                build.onLoad({ filter: /[/\\](?:palette|feedback|background)\.css$/ }, async ({ path }) => {
                    const source = await Bun.file(path).text();
                    const contents =
                        path === join(sourceRoot, "background.css")
                            ? backgroundStyles(source)
                            : appearanceTokens(source);
                    return { contents, loader: "css" };
                });
            },
        },
    ],
});

if (!result.success) {
    throw new AggregateError(result.logs, "Obsidian theme bundling failed");
}
const stylesheet = result.outputs.find(output => output.path.endsWith(".css"));
if (!stylesheet || result.outputs.length !== 1) {
    throw new Error("Expected a single self-contained Obsidian stylesheet");
}
const licences = await Promise.all(fontPackages.map(fontLicence));
const css = await stylesheet.text();
await Bun.write(
    join(outputRoot, "theme.css"),
    ["/* Copyright © 2026 White Eclipse. Released under the MIT License. */", ...licences, css].join("\n\n"),
);
await Bun.write(join(outputRoot, "manifest.json"), Bun.file(join(sourceRoot, "obsidian/manifest.json")));
