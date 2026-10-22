/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { extname, relative, resolve, sep } from "node:path";
import { normalizePath } from "vite";

/** One application-local language and namespace discovered by the plugin. */
interface LocaleFile {
    file: string;
    language: string;
    namespace: string;
}

/**
 * Identifies YAML namespaces at any depth below a language directory.
 *
 * @param file - Candidate source file.
 * @param directory - Application locale directory.
 * @returns Whether the source belongs to the configured locale tree.
 */
export function isLocaleFile(file: string, directory: string): boolean {
    const parts = relative(directory, file).split(sep);
    const requiredParts = 2;
    return parts.length >= requiredParts && parts[0] !== ".." && file.endsWith(".yaml");
}

/**
 * Discovers locale namespaces and rejects ambiguous duplicate namespace files.
 *
 * @param directory - Directory containing language folders and YAML namespaces.
 * @returns A deterministic inventory of locale source files.
 * @rejects If the directory cannot be scanned or a namespace is duplicated.
 */
export async function discoverLocales(directory: string): Promise<LocaleFile[]> {
    const files = await Array.fromAsync(new Bun.Glob("**/*.yaml").scan({ cwd: directory, onlyFiles: true }));
    const namespaces = new Set<string>();
    return files
        .filter(file => isLocaleFile(resolve(directory, file), directory))
        .sort((left, right) => left.localeCompare(right))
        .map(file => {
            const [language, ...parts] = file.split(sep);
            if (language === undefined) {
                throw new Error(`Cannot identify language for ${file}.`);
            }
            const namespace = parts.join(".").slice(0, -extname(file).length);
            const key = `${language}/${namespace}`;
            if (namespaces.has(key)) {
                throw new Error(`Duplicate locale namespace: ${key}`);
            }
            namespaces.add(key);
            return { file: resolve(directory, file), language, namespace };
        });
}

/**
 * Produces a virtual resource registry using regular YAML module imports.
 *
 * @param files - Discovered language and namespace files.
 * @returns Browser-safe JavaScript assembled from Vite-managed imports.
 */
export function createRegistry(files: readonly LocaleFile[]): string {
    const imports = files.map(
        (entry, index) => `import locale${index} from ${JSON.stringify(normalizePath(entry.file))};`,
    );
    const entries = files.map(
        (entry, index) => `[${JSON.stringify(entry.language)}, ${JSON.stringify(entry.namespace)}, locale${index}]`,
    );
    return `${imports.join("\n")}
const resources = Object.create(null);
for (const [language, namespace, messages] of [${entries.join(",")}]) {
    resources[language] ??= Object.create(null);
    resources[language][namespace] = messages;
}
export { resources };
export default resources;
`;
}

/**
 * Parses one YAML namespace using Bun and emits a JSON-compatible JavaScript module.
 *
 * @param file - YAML namespace source file.
 * @returns The JavaScript module containing the parsed messages.
 * @rejects If YAML is invalid, cyclic, unreadable, or not a namespace mapping.
 */
export async function compileLocale(file: string): Promise<string> {
    try {
        const parsed: unknown = Bun.YAML.parse(await Bun.file(file).text());
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
            throw new Error("A locale namespace must be a YAML mapping.");
        }
        const serialized = JSON.stringify(parsed);
        return `export default JSON.parse(${JSON.stringify(serialized)});`;
    } catch (cause) {
        throw new Error(`Cannot compile locale namespace ${file}.`, { cause });
    }
}
