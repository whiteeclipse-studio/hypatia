/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import {
    type DocumentArtifact,
    type Repository,
    toLogicalPath,
    type TranslationArtifact,
} from "@whiteeclipse/docs-compiler";
import type { PublicProject } from "../app/configuration";
import type { Entry, PageData, PreparedProject } from "../modules/documentation/domain/types";
import { directoryRoutes, documentRoute } from "../modules/documentation/domain/routes";
import { directoryTitle } from "../modules/documentation/domain/directory-title";
import { passiveAsset, safeTree } from "./sanitize";


type PageArtifact = DocumentArtifact | TranslationArtifact;

/**
 * Prepares independently owned page data before compiler snapshot replacement.
 *
 * @param repository The repository value.
 * @param project The project value.
 * @param generation The generation value.
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 * @throws {Error} If the supplied input or current state is invalid.
 */
export async function prepareProject(
    repository: Repository,
    project: PublicProject,
    generation: string,
): Promise<PreparedProject> {
    const prepared: PreparedProject = {
        index: { project, generation, entries: [], assets: {} },
        pages: {},
        assets: {},
    };
    const documents = [...repository]
        .map(([, artifact]) => artifact)
        .filter(
            (artifact): artifact is PageArtifact => artifact.type === "document" || artifact.type === "translation",
        );
    for (const artifact of documents) {
        const entry = describe(artifact, documents, project.id);
        const page = prepared.pages[entry.route] ?? {
            route: entry.route,
            title: entry.title,
            variants: {},
            directory: false,
        };
        if (page.variants[entry.locale] !== undefined) {
            throw new Error(`Route collision: ${entry.route} (${entry.locale}).`);
        }
        await readDocument(artifact, entry, page);
        prepared.index.entries.push(entry);
        prepared.pages[entry.route] = page;
    }
    addDirectories(prepared);
    await addAssets(repository, prepared);
    prepared.index.entries.sort((a, b) => a.path.localeCompare(b.path, "en"));
    return prepared;
}

/**
 * Maps translations onto their canonical page while retaining orphan translations.
 *
 * @param artifact The artifact value.
 * @param documents The documents value.
 * @param project The project value.
 * @returns The prepared result.
 */
function describe(artifact: PageArtifact, documents: PageArtifact[], project: string): Entry {
    const entry: Entry = {
        path: artifact.path,
        route: documentRoute(project, artifact.path),
        id: artifact.metadata.id,
        title: artifact.metadata.title,
        locale: "en",
        navigable: artifact.type === "document" && artifact.metadata.navigable,
    };
    if (artifact.type === "translation") {
        const sourceId = artifact.metadata.sourceId;
        const source = documents.find(item => item.type === "document" && item.metadata.id === sourceId);
        if (source !== undefined) {
            entry.route = documentRoute(project, source.path);
        }
        entry.sourceId = sourceId;
        entry.locale = artifact.metadata.locale;
    }
    return entry;
}

/**
 * Reads sanitized article and metadata trees into a locale variant.
 *
 * @param artifact The artifact value.
 * @param entry The entry value.
 * @param page The page value.
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 */
async function readDocument(artifact: PageArtifact, entry: Entry, page: PageData): Promise<void> {
    const tree = await artifact.read();
    // The application supplies the title once; keep the remaining article structure intact.
    if (tree.children[0]?.type === "element" && tree.children[0].tagName === "h1") {
        tree.children.shift();
    }
    const result = page;
    result.variants[entry.locale] = {
        title: entry.title,
        navigation: readNavigation(artifact.path, { ...artifact.metadata }),
        tree: safeTree(tree),
        copyrightAndLicence: safeTree(artifact.metadata.copyrightAndLicence),
        revisions: artifact.metadata.revisions.map(revision => {
            return { ...revision, author: safeTree(revision.author), description: safeTree(revision.description) };
        }),
    };
    if (entry.locale === "en") {
        result.title = entry.title;
    }
}

/**
 * Resolves optional frontmatter paths relative to their document, within the repository.
 *
 * @param source Logical path of the document declaring the links.
 * @param metadata Inert compiler metadata, including frontmatter extensions.
 * @returns Independently resolved navigation paths; invalid values are omitted.
 */
function readNavigation(source: string, metadata: Record<string, unknown>) {
    const navigation: Partial<Record<"parent" | "previous" | "next", string>> = {};
    for (const field of ["parent", "previous", "next"] as const) {
        const path = navigationPath(source, metadata[field]);
        if (path !== undefined) {
            navigation[field] = path;
        }
    }
    return navigation;
}

/**
 * Normalizes a relative Markdown destination without allowing traversal beyond the repository.
 *
 * @param source Logical path of the declaring document.
 * @param value Untrusted frontmatter field.
 * @returns A logical document path, or undefined for invalid destinations.
 */
function navigationPath(source: string, value: unknown): string | undefined {
    if (typeof value !== "string" || /^(?:\/|\s)|[\\:?#\0]/.test(value) || !/\.md$/i.test(value)) {
        return undefined;
    }
    const segments = source.split("/");
    segments.pop();
    for (const segment of value.split("/")) {
        if (segment === "..") {
            if (segments.pop() === undefined) {
                return undefined;
            }
        } else if (segment !== "." && segment !== "") {
            segments.push(segment);
        }
    }
    return toLogicalPath(segments.join("/"));
}

/**
 * Adds folder indexes where the repository does not provide a README document.
 *
 * @param prepared The prepared value.
 */
function addDirectories(prepared: PreparedProject): void {
    const result = prepared;
    for (const route of directoryRoutes(result.index)) {
        const segments = route.split("/").filter(Boolean);
        const title =
            segments.length === 1
                ? prepared.index.project.name
                : directoryTitle(segments[segments.length - 1] ?? prepared.index.project.name);
        result.pages[route] ??= { route, title, variants: {}, directory: true };
    }
}

/**
 * Copies passive assets and maps them to immutable generation-specific locations.
 *
 * @param repository The repository value.
 * @param prepared The prepared value.
 * @returns The prepared result.
 * @rejects If loading, validation or resource cleanup fails.
 */
async function addAssets(repository: Repository, prepared: PreparedProject): Promise<void> {
    const result = prepared;
    for (const [path, artifact] of repository) {
        if (artifact.type === "document" || artifact.type === "translation" || artifact.type === "unknown") {
            continue;
        }
        const asset = await passiveAsset(await artifact.read());
        if (asset === undefined) {
            continue;
        }
        result.assets[path] = asset;
        result.index.assets[path] = `/_assets/${prepared.index.project.id}/${prepared.index.generation}/${path}`;
    }
}
