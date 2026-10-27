---
id: documentation-builder-readme
standard_revision: 1
---

# @whiteeclipse/documentation-builder

Build a repository's documentation into a portable TAR.GZ artifact, consume that artifact in Vite, and read it in a browser. This README covers `0.1.0-alpha.1`, an exploratory implementation of [Hypatia RFC-0005 revision 1](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/rfcs/0005-documentation-publication.md#revisions). The RFC remains a draft; this package has not been approved for production publication.

## Setup

Use Bun 1.4 or later for the CLI, source builds, and Vite integration. Browser entrypoints target modern browsers with module workers, streaming decompression, Fetch, Blob URLs, and AbortSignal timeout support. Node.js is not a supported build runtime.

The repository root declares this package as a workspace development dependency. Install dependencies and build its executable from the repository root:

```sh
bun install
bun run --cwd packages/platform/documentation-builder build
bun run documentation-builder --help
```

`bun run` resolves the locally installed `documentation-builder` executable. Package scripts can invoke `documentation-builder` directly; an ordinary terminal can also use `./node_modules/.bin/documentation-builder`.

TypeScript entrypoints use conditional exports: `default` selects built JavaScript, `types` selects adjacent declarations, and `development` selects source TypeScript. The declaration-only Vite client entrypoint has an empty JavaScript counterpart. Source files are included alongside the built distribution.

The distribution is bundled with Bun and includes declarations, an executable CLI, workers, their supporting chunks, and original third-party licence notices. Consumers outside the workspace can install a locally packed distribution; registry publication is separate. Vite 8 is an optional peer needed only for the `/vite` integration. The package has no React dependency.

## Source builds

```sh
bun run documentation-builder build ./my-project --out ./dist/my-project.tar.gz
```

The command loads `documentation.config.mjs` from the repository root when present. Use `--config <file.mjs>` to select an explicit trusted ESM configuration. Output paths are relative to the caller's working directory. The repository must contain `docs` and be a Git checkout; repository identity defaults to `remote.origin.url` and the commit to `HEAD`. Dirty state is recorded separately.

The programmatic API uses the same pipeline:

```ts
import { buildDocumentation, writeArtifact } from "@whiteeclipse/documentation-builder";

const repositoryRoot = "/work/my-project";
const artifact = await buildDocumentation({ repositoryRoot });
await writeArtifact(artifact, "/work/output/my-project.tar.gz", { repositoryRoot });
```

`buildDocumentation` accepts options directly. To consume an ESM configuration programmatically, import its default export and pass it with `repositoryRoot`. CLI and local Vite configuration loading are automatic.

## Configuration and generated pages

Configuration fields are `repositoryRoot`, `repository`, `name`, `commit`, `plugins`, `generatedPages`, and `limits`. Explicit repository identity must be a public HTTP(S) URL without credentials. Commit overrides must be complete Git hashes; supplying one does not make a dirty checkout a clean snapshot.

Each authored Markdown page needs an ID, an applicable standards revision pin, a title, a Copyright and licence section, and a final Revisions table. See the authoritative [authoring standard revision 1](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/standards/AUTHORING.md#revisions). Supporting pages can inherit their pin from the nearest enclosing pinned README.

Folders without README pages receive generated indexes. Asset-only folders do not. A root `LICENCE.md` is preferred over `LICENCE`; either becomes `LICENCE.html`. A licence without document metadata receives a generated wrapper, with plain-text licences displayed as escaped text.

Generated indexes inherit the complete copyright and licence notice and revision table from the nearest authored `README.md` in their folder or an ancestor folder. A generated `LICENCE.html` wrapper inherits those disclosures from `docs/README.md`. Relative disclosure links retain their original README location. Inherited histories describe that source README; the builder does not invent a separate history for generated pages.

IDs default to `generated-` followed by the lowercase output path without `.html`, with non-alphanumeric runs replaced by hyphens. Titles use the folder name with hyphens and underscores replaced by spaces and the first letter capitalized; the root index uses `Documentation`, and the licence wrapper uses `Licence`. Authored pages retain their own metadata.

Optional `generatedPages` entries override individual fields, keyed by output HTML path, such as `index.html`, `public/index.html`, or `LICENCE.html`:

```ts
interface GeneratedPageMetadata {
    id?: string;
    title?: string;
    copyrightAndLicence?: string; // Complete notice in Markdown.
    revisions?: string; // Complete Markdown revision table.
}
```

Without an ancestor README, both disclosures need explicit values. Explicit revision tables use Revision, Date, Author, and Description columns, start at 1, and increase sequentially. Invalid explicit values still fail validation. Generated IDs share the authored ID namespace; override an ID if path normalization produces a collision.

For example, customize the licence identity while inheriting its disclosures:

```js
export default {
    generatedPages: {
        "LICENCE.html": {
            id: "project-licence",
            title: "Project licence",
        },
    },
};
```

## Transformations

Plugins run in configured order before Markdown processing. They receive virtual source files and return the complete replacement collection. A source file contains a `docs`-relative `path` and `Uint8Array` content.

```js
const normalizeLineEndings = {
    name: "normalize-line-endings",
    transform(files) {
        return files.map(file => {
            if (!file.path.endsWith(".md")) return file;
            const text = new TextDecoder().decode(file.content).replaceAll("\r\n", "\n");
            return { ...file, content: new TextEncoder().encode(text) };
        });
    },
};

export default { plugins: [normalizeLineEndings] };
```

Plugins may declare `watchFiles`, relative to the repository root, for additional development dependencies. Their context contains repository identity and a cancellation signal. Plugins and ESM configuration are trusted executable build code; cancellation is cooperative. They never execute in the reader's browser. OpenAPI generation is deferred.

## Artifact and rendering APIs

`/artifact` exports `loadArtifact`, `validateArtifact`, `packArtifact`, `renderPage`, manifest types, default limits, and `DocumentationError`. File collections remain in memory; archive loading never extracts files to disk.

Version 1 archives contain `manifest.json`, sanitized HTML article fragments, and supporting assets. Paths mirror `docs`; Markdown becomes HTML and exact `README.md` names become `index.html`. Notices and complete revision histories are embedded in page entries rather than article bodies. `AGENTS.md` remains directly addressable and is omitted from navigation.

The manifest records repository identity, commit and dirty state, pages, folder navigation, and an exact file inventory. Page entries expose their own `revision`, independently of the source's `standard_revision`.

```ts
import { loadArtifact, renderPage } from "@whiteeclipse/documentation-builder/artifact";

const artifact = await loadArtifact(archiveBytes);
const page = await renderPage(artifact, artifact.manifest.pages[0].id);
```

Rendered results contain `html`, `copyrightAndLicence`, `revisions`, `revision`, `id`, and `title`. Place disclosures in separate application controls. Default links use `/<repository-name>/`; `projectRoot` and `assetUrls` let SSR consumers supply hosting mappings. Do not mutate validated artifacts.

## Browser use

```ts
import { createArtifactReader, downloadArtifact } from "@whiteeclipse/documentation-builder/browser";
import "@whiteeclipse/documentation-builder/styles.css";

const artifact = await downloadArtifact("/artifacts/my-project.tar.gz");
const reader = createArtifactReader(artifact);
const page = await reader.render(artifact.manifest.pages[0].id);
// Render page.html and the separate disclosures in the application.
// Call reader.dispose() when replacing or removing this artifact.
```

The reader resolves supporting assets from loaded bytes through owned Blob URLs. `dispose()` revokes them and prevents further rendering. `downloadWithFallback(url, baseline)` returns `{ artifact, usedFallback, error? }`, retaining a revalidated baseline when a newer download fails. Download options accept a cancellation signal, resource limits, and a consumer-supplied fetch implementation.

Browser loading and rendering use terminable module workers. Consumers must permit those workers and Blob asset URLs in their application policies. Persistent caching, storage controls, offline application-shell support, and routing belong to the consuming website.

## Vite integration

```ts
import { defineConfig } from "vite";
import { documentationPlugin } from "@whiteeclipse/documentation-builder/vite";

export default defineConfig({
    plugins: [
        documentationPlugin({
            sources: [
                {
                    local: { repositoryRoot: "../my-project" },
                    artifact: "https://example.org/artifacts/my-project.tar.gz",
                },
            ],
        }),
    ],
});
```

Add `@whiteeclipse/documentation-builder/vite/client` to the application's TypeScript `types`. Import `projects` from `virtual:whiteeclipse-documentation`; each project exposes its manifest, `artifactUrl`, `assetUrls`, and asynchronous `getPage(pageId, options?)`.

Development prefers local sources, loads their configuration, and reloads after source changes. Failed rebuilding preserves the previous validated snapshot and reports an overlay error. Production requires an `artifact` URL or local archive path for every source and fails on download or validation errors. It never reparses repository Markdown.

The plugin emits assets below the repository URL root, public metadata, and a content-addressed baseline archive below `_documentation`. The virtual module includes baseline articles for SSR and hydration. Consumers generate complete website pages themselves; the plugin does not emit article fragments over those routes. Repository-root collisions are rejected. Vite's base must be origin-relative.

## Security, diagnostics, and limits

The implementation follows the [publication standard revision 1](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/standards/PUBLICATION.md#revisions). Source front matter and source YAML assets use Bun's builtin YAML parser. Portable readers treat YAML as inert UTF-8 downloads rather than interpreting it.

Supported assets are PNG, JPEG, GIF, WebP, JSON, YAML, text, static sanitized SVG, and passive downloadable PDF. Asset signatures, dimensions, syntax, or structure are checked according to format. Unsupported formats fail. SVG styling, animation, embedded HTML, and external resources are removed or rejected. Active or encrypted PDFs fail. Complex formats add parsing dependencies and distribution weight; PDF parsing is loaded separately.

Safe unresolved authored destinations produce `unresolved-link` diagnostics and remain unchanged. Invalid manifest references, escaping paths, unsafe schemes, duplicate outputs, malformed metadata, and exceeded resource limits fail. Source symlinks and output within `docs` are rejected. Output replacement is atomic after complete generation and validation.

| Limit                      | Default    |
| -------------------------- | ---------- |
| Files                      | 10,000     |
| Compressed archive         | 100 MiB    |
| Expanded archive           | 250 MiB    |
| Individual file            | 25 MiB     |
| Worker processing deadline | 60 seconds |

Input and expanded sizes are bounded during processing. Raster dimensions are limited to 50 million pixels, SVG nesting to 64 elements, and PDF inspection to 100,000 objects. Archive loading supports regular USTAR files and PAX extended paths, rejecting links, special files, and malformed framing.

`DocumentationError.code` identifies failures such as `metadata`, `collision`, `unsafe-path`, `unsafe-link`, `unsafe-asset`, `limits`, `timeout`, `download`, and `manifest-version`. Other dependency or filesystem errors can propagate from source APIs; CLI failures exit with code 1.

## Development and remaining work

Run `bun run typecheck` separately or `bun run build` to type-check and generate the distribution. Shared ESLint and Prettier checks apply to source files. Generated `dist` output is excluded from source checks.

Run `bun test src/source/pipeline.spec.ts` from this package to check generated-page defaults, inherited relative links, explicit overrides, and licence metadata handling. Browser automation and broader behavioral, cross-browser, and security verification remain deferred. Production promotion requires the applicable validation and human decisions; successful tests, type checking, and bundling do not establish security compliance.

The builder provides no built-in access control. Actual publication, including the draft RFC's public-only policy and its relationship to category restrictions, remains outside this delivery. Website UI, PWA retention, deployment integration, and OpenAPI generation are deferred.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                                        |
| -------- | ---------- | ------------- | ------------------------------------------------------------------ |
| 1        | 2026-10-27 | Akane SHIMOKA | Add exploratory builder with inherited generated-page metadata     |
| 2        | 2026-10-27 | Codex         | Align conditional JavaScript, declaration, and development exports |
