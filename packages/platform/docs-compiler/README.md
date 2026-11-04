---
id: documentation-builder-readme
standard_revision: 1
---

# @whiteeclipse/docs-compiler

Compile documentation sources into immutable in-memory Repository snapshots through configurable plugins. This README
covers the exploratory `0.1.0-alpha.2` compiler
under [draft Hypatia RFC-0005 revision 2](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/rfcs/0005-documentation-publication.md#revisions).
Separate plugins parse Markdown and write repository archives; this implementation is not approved for production
publication. See
the [package specifications](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/packages/docs-compiler/README.md).

## Setup

The compiler owns its shared cache through the
standalone [@whiteeclipse/cache library](../../libraries/cache/README.md). The filesystem plugin supplies raw assets
without parsing Markdown syntax.

Call `compile()` at most once during a browser worker's lifetime. Calling it more than once in the same worker results
in undefined behaviour, including after an earlier call fails or its result is disposed. Use a new worker for each
invocation.

The compiler loads scoped `core-js` polyfills for `Symbol.dispose`, `Symbol.asyncDispose`, `SuppressedError`, and
`AsyncDisposableStack` before running hooks. These install runtime APIs where needed. Browser builds must also
transpile `using` and `await using` syntax for browsers that do not support it. Safari runtime verification is pending.

### Filesystem sources

`filesystemLoader()` is exported separately from
`@whiteeclipse/docs-compiler/packages/filesystem-loader`. It requires Bun with `Bun.Image.metadata()`, native
`node:fs` watching, `node:fs/promises.glob`, and `node:path.matchesGlob`; its package entrypoint is disabled for browser
and non-Bun builds.
No filesystem code is imported by the main compiler entrypoint.

The following source-level example runs from the package directory:

```ts
import { compile } from "./src";
import { filesystemLoader } from "./src/plugins/filesystem-loader";

await using snapshot = await compile({
    repositories: "../../..",
    plugins: [filesystemLoader()],
});

for (const [, repository] of snapshot) {
    for (const [path, artifact] of repository) {
        console.log(path, artifact.type, artifact.metadata);
    }
}
```

`resolveId` accepts repository-directory paths and `file:` URLs. Relative inputs resolve against `cwd`, defaulting
to the current working directory when the plugin is constructed. Repository source IDs are canonical absolute paths;
output IDs are normalized directory basenames, with a capitalized basename as the display name. Conflicting output IDs
are rejected by snapshot assembly. Other URL protocols delegate to other plugins.

Artifact source identities contain `{ repositoryId, path }`, where `path` is the normalized logical output path.
The loader retains original physical filenames separately for reads and importer-relative resolution.

`load` supplies an empty repository representation. Its repository `transform` discovers selected regular files,
loads them through `this.load()`, and assembles their transformed results into an inventory.
Symbolic files and directory links are skipped. Each source is loaded as an `asset` with its original bytes,
`mimeType` and byte `size` metadata, and a compiler-cache payload descriptor. No Markdown syntax or frontmatter is
parsed.

All configuration fields are optional:

```ts
filesystemLoader({
    cwd: process.cwd(),
    include: [
        "docs/**/*.md",
        "LICENCE",
        "LICENSE",
        "LICENCE.md",
        "LICENSE.md",
    ],
    exclude: ["docs/translations/**"],
});
```

These are the default file-selection rules. Supplied `include` and `exclude` arrays replace their respective defaults.
Globs are repository-relative, use forward slashes, and follow the runtime's native case-sensitive glob matching.
Custom globs can select non-Markdown files, for example `include: ["docs/**", "LICENCE"]`.
MIME types are inferred through `Bun.file(path).type` without reading the file; this does not validate the contents.
Bun supplies MIME parameters where applicable and uses `application/octet-stream` for unknown extensions.
Markdown and extensionless licence files remain `text/markdown` assets.
`Bun.Image.metadata()` reads pixel dimensions from the already-loaded bytes without decoding pixels;
supported formats depend on the Bun runtime and platform. Dimensions do not apply EXIF orientation.
Uncompressed PCM and IEEE float WAV headers provide duration in seconds. Unsupported or malformed headers leave
these optional fields absent. Images unsupported by Bun (including SVG), compressed audio, video metadata, and PDF page
counts need additional format readers that are not implemented. The loader uses no subprocesses or additional
dependencies.
Root READMEs receive no special treatment. Missing matching files produce an empty inventory.

Logical paths retain their repository-relative directory and extension. `toLogicalPath` lowercases paths, normalizes
separators and relative-directory segments, and replaces unsupported characters with underscores. For example,
`docs/Guide Name.md` becomes `docs/guide_name.md`. Distinct files producing the same logical path reject the build.

With `watch: true`, the plugin registers a native recursive directory subscription through `this.watch()` before
source discovery. File events invalidate affected source references and the repository inventory; additions, removals,
and directory renames are rediscovered. Coarse events and events without filenames compare known file stat versions
before invalidating child sources. Excluded paths
and unselected content-change events without known linked sources are ignored. The compiler coalesces notifications into
at most one pending rebuild
and reuses unchanged file records. Watcher failures are reported through the session's error stream; shutdown closes
watchers.
Native watching behaviour and recursive-watch availability depend on the runtime and filesystem.

File versions use filesystem identity, byte length, and nanosecond modification/change timestamps. Loading rejects
if the observed version changes between resolution and the end of the read. This does not provide an atomic filesystem
snapshot across all source files. Raw bytes are stored under fresh immutable keys in the compiler-owned cache, never
in a plugin cache. Artifact reads return independent Blobs and fail on a missing payload instead of reading newer disk
contents. Successful watch replacements invalidate earlier snapshots; failed rebuilds preserve the current snapshot.

`mergeCompilationConfiguration(base, overrides)` deeply freezes nested configuration, replaces repository inputs,
appends plugins, and merges individual cache options. The default compiler cache uses 100 MiB of LRU memory, followed
by temporary filesystem storage on servers or IndexedDB in browsers. `cache: { memoryMaxBytes: 0 }` disables memory
retention while keeping secondary storage available. Plugins neither construct nor dispose the shared cache.

One-shot compilation runs `closeBundle` after `buildEnd`, then returns a Snapshot owning cleanup. Watch builds skip
`closeBundle`; the watch session retains resource ownership until disposal. Cleanup drains admitted reads before
releasing backing storage.

### Markdown parsing

`markdownParser()` is exported from `@whiteeclipse/docs-compiler/packages/markdown-parser` for Bun.
It uses the built-in `Bun.YAML.parse()` API; its entrypoint is disabled for browser and non-Bun runtimes.
Place it after source loading plugins:

```ts
import { markdownParser } from "@whiteeclipse/docs-compiler/packages/markdown-parser";

const plugins = [filesystemLoader(), markdownParser({ wikilinks: false, callouts: false })];
```

The parser converts `text/markdown` assets to `DocumentArtifact` values, or `TranslationArtifact` values when
front matter contains `source_id`. It extracts title, copyright and licence HAST, and structured revisions;
notice and revision sections are removed from article contents. Other front matter fields remain available
as metadata extensions. Plain Markdown without metadata uses its logical path as ID and title, with empty notices
and revisions. This does not establish authoring-standard compliance.

Both optional syntax flags default to `false`. Install `remark-wiki-link@2.0.1` before enabling `wikilinks`,
and `@r4ai/remark-callout@0.6.2` before enabling `callouts`. Disabled flags never import those peers and work
when they are uninstalled. Callout parsing recognizes custom types such as `> [!outline]`; it does not generate
an outline from headings. Raw source HTML is disabled. Links retain authored destinations, and translation
source resolution belongs to later plugins.

Article reads return independent HAST trees backed by the compiler cache, including across incremental reuse.
See
the [Markdown parser reference](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/packages/docs-compiler/plugins/markdown-transformer.md)
for metadata defaults, translation locales, localized section headings, and error behavior.

### Link resolution

Place `linkResolver()` after `markdownParser()`:

```ts
import { linkResolver } from "@whiteeclipse/docs-compiler/packages/link-resolver";

const plugins = [filesystemLoader(), markdownParser(), linkResolver()];
```

The plugin resolves relative destinations in article HAST and formatted notice and revision metadata. It rewrites
their path components to repository-root logical paths while retaining queries and fragments. External URLs,
website-root URLs, and local fragments remain unchanged. Targets are queued for inclusion without awaiting their
transform chains, so mutual links and self-links are supported. Linked resources are loaded and transformed before
the repository completes, including non-excluded filesystem sources outside discovery globs. Target content is not
read by this resolver.

Compiler load and transform contexts now expose resolution-only `resolve(input)` and non-awaiting
`include(reference)` services alongside `load(input)`. The latter still awaits the full target pipeline and detects
recursive loading cycles. Queued inclusions are retained across watch rebuilds.

See
the [link resolver reference](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/packages/docs-compiler/plugins/link-resolver.md)
for destination coverage, errors, and identity contracts. Translation association and publication sanitization remain
separate processing stages.

### Translation discovery

The filesystem loader can discover and include translations of parsed documents. Put the Markdown parser before it
in the plugin list when enabling `translations`:

```ts
const plugins = [
    markdownParser(),
    filesystemLoader({ translations: true }),
    linkResolver(),
];
```

The option defaults to `false`. Enabling it skips `docs/translations/**` during automatic source discovery while
allowing related translations to resolve by default. All explicit exclusions still apply. The loader searches
mirrored directories for `<filename>.<language>.md` files using original physical filenames, queues candidates without
awaiting their transforms, and checks their parsed `source_id` in `buildEnd`. This also handles canonical documents
included through links. Translation-directory changes invalidate discovery in watch mode, including when a document
gains its first translation.

See
the [filesystem translation reference](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/packages/docs-compiler/plugins/filesystem-translations.md)
for the candidate API, ordering, exclusions, and remaining validation boundaries.

### Archive output

`archiveWriter()` is exported from `@whiteeclipse/docs-compiler/packages/archive-writer` and requires Bun's native
`Archive.write` API. It adds no dependencies and does not load archive or filesystem APIs into the main browser
entrypoint.

From the package directory, add it after the source and transformation plugins:

```ts
import { compile } from "./src";
import { filesystemLoader } from "./src/plugins/filesystem-loader";
import { archiveWriter } from "./src/plugins/archive-writer";

await using snapshot = await compile({
    repositories: "../../..",
    plugins: [
        filesystemLoader(),
        archiveWriter({ outputDirectory: "./dist/docs" }),
    ],
});
```

`outputDirectory` is optional and defaults to `./dist/docs`. It resolves against the process working directory when
the plugin is constructed. The writer creates it when needed and writes one `<repository.id>.tar.gz` file per
repository.
IDs must identify single filenames; empty IDs, traversal, path separators, and NUL characters are rejected. Duplicate
output filenames are rejected before writing any repository.

The writer runs in `closeBundle`, after transformations and `buildEnd`. Watch mode skips it. The archive contains
`manifest.json`, UUIDv7-keyed JSON records under `artifacts/`, and separate UUIDv7-keyed binary entries under
`payloads/`.
Documents and translations include their complete HAST content inline in their JSON record. Raw Markdown from the
filesystem loader remains a `text/markdown` asset with a separate binary payload. Unknown artifacts contain metadata
only. Intermediate `hast` artifacts must be transformed into a supported final type before encoding.

Encoding validates the existing serialization schemas, requires metadata and inline content to survive a JSON round
trip without loss, and checks each asset Blob against its MIME type and byte size. Archive keys are newly generated
and independent of source paths and compiler-cache keys. A repository's entries are collected before compression,
so memory usage depends on that repository's payload size.

Each archive is compressed into a private staging directory inside the output directory, then renamed to its final
filename. Encoding, compression, or cancellation failures before that rename preserve the previous archive. Staging
is removed on success and failure. Replacement is atomic per repository; a later repository failure does not roll back
archives already written earlier in the same compilation.

Run `bun --conditions=development test/compile.ts` from this package to compile the repository-local documentation
and create `dist/docs/hypatia.tar.gz`. The archive rules are documented in the
[serialization reference](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/packages/docs-compiler/serialization.md).

The sections below retain reference material for the earlier `documentation-builder@0.1.0-alpha.1` prototype.
Their archive, parser, rendering, and Vite APIs do not describe the current compiler entrypoints.

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

Relative source links to the imported repository-root `LICENCE` or `LICENCE.md` become links to `LICENCE.html`, including links in inherited disclosures. Queries and fragments are preserved. Other links leaving `docs` remain rejected; artifact HTML references must stay inside the artifact.

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

## Logging in the current compiler prototype

The current `@whiteeclipse/docs-compiler` implementation obtains loggers from `@whiteeclipse/log` under
`["whiteeclipse", "docs-compiler"]`, with `configure` and `resolve` subcategories. It does not initialize logging;
consuming entrypoints choose the configuration described in
the [log package README](https://github.com/whiteeclipse-studio/hypatia/blob/main/packages/libraries/log/README.md).

| Level     | Events                                                                                                                        |
|-----------|-------------------------------------------------------------------------------------------------------------------------------|
| `trace`   | Plugin visits, source references and identities, shared resolution requests, and context resource counts                      |
| `debug`   | Compiler creation and disposal, build admission, configuration reuse, repository entrypoint counts, and shutdown cancellation |
| `info`    | Started and completed resolution-only compilations                                                                            |
| `warning` | Unsupported watch registration                                                                                                |
| `error`   | Failed compilations, source resolution, resolution cycles, and context cleanup, with the original failure                     |

Plugin hooks receive a readonly `this.logger` through `BaseContext`, typed as `Logger` from `@whiteeclipse/log`.
Configuration hooks use the `configure` category; resolution hooks, including nested resolution, use `resolve`. The
declared load and transform contexts inherit the same logger facility, while their runners remain unimplemented. Plugins
can call `this.logger.debug("Reading source.")` or derive a plugin-specific child with
`this.logger.getChild("my-plugin")`. Logging configuration remains owned by the application.

Build lifecycle records contain module-local compiler and per-compiler build IDs. Plugin-defined metadata, configuration
objects, and document contents are not logged. Optional unhandled references are traced; unresolved required entrypoints
still reject compilation. Logs preserve explicit rejections and existing cleanup error events. Queue diagnostics can
additionally describe the same operation under the queue's category.

Completion messages identify the resolution-only prototype and do not claim that snapshots were assembled or published.
Loading, transformation, snapshot assembly, and watching remain unimplemented. This logging work remains exploratory
under draft RFC-0005.

## Development and remaining work

Run `bun run typecheck` separately or `bun run build` to type-check and generate the distribution. Shared ESLint and Prettier checks apply to source files. Generated `dist` output is excluded from source checks.

Run `bun test src/source/pipeline.spec.ts src/source/links.spec.ts` from this package to check generated-page defaults, inherited relative links, explicit overrides, licence metadata handling, and root licence link confinement. Browser automation and broader behavioral, cross-browser, and security verification remain deferred. Production promotion requires the applicable validation and human decisions; successful tests, type checking, and bundling do not establish security compliance.

The builder provides no built-in access control. Actual publication, including the draft RFC's public-only policy and its relationship to category restrictions, remains outside this delivery. Website UI, PWA retention, deployment integration, and OpenAPI generation are deferred.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                                                                      |
|----------|------------|---------------|--------------------------------------------------------------------------------------------------|
| 1        | 2026-10-27 | Akane SHIMOKA | Add exploratory builder with inherited generated-page metadata                                   |
| 2        | 2026-10-27 | Codex         | Align conditional JavaScript, declaration, and development exports                               |
| 3        | 2026-10-27 | Codex         | Resolve imported root licence links while preserving confinement                                 |
| 4        | 2026-10-28 | Codex         | Identify the cache extraction during the compiler rebuild                                        |
| 5        | 2026-10-28 | Codex         | Align lazy asset access with Blobs and reader-owned cache lifetimes                              |
| 6        | 2026-10-28 | Codex         | Define local repository inputs and the owned-cache adapter skeleton                              |
| 7        | 2026-10-28 | Codex         | Reference the standalone queue dependency for repository operation tracking                      |
| 8        | 2026-10-28 | Codex         | Queue local discovery and add a Hypatia documentation inspection script                          |
| 9        | 2026-10-28 | Codex         | Explicitly discover root LICENCE and LICENCE.md inputs                                           |
| 10       | 2026-10-28 | Codex         | Support LICENSE and LICENSE.md aliases in root discovery                                         |
| 11       | 2026-10-28 | Codex         | Include root licences as documents and reject ambiguous aliases                                  |
| 12       | 2026-10-28 | Codex         | Map canonical document and asset paths while preserving source locations                         |
| 13       | 2026-10-28 | Codex         | Parse document MDAST with frontmatter, GFM, wikilinks, and callouts using cataloged dependencies |
| 14       | 2026-10-29 | Akane SHIMOKA | Link docs-compiler package documentation                                                         |
| 15       | 2026-10-30 | Codex         | Add compiler diagnostics and hook context logger access                                          |
| 16       | 2026-10-30 | Akane SHIMOKA | Remove obsolete builder scripts and point to the current fixture                                 |
| 17       | 2026-11-03 | Codex         | Document disposal polyfills and browser syntax requirements                                      |
| 18       | 2026-11-03 | Codex         | Document local Markdown discovery, raw assets, and package usage                                 |
| 19       | 2026-11-03 | Codex         | Document transform hooks and recursive child processing                                          |
| 20       | 2026-11-03 | Codex         | Derive local repository identity and add the Markdown parser plugin                              |
| 21       | 2026-11-03 | Codex         | Use DocumentArtifact with default metadata for parsed Markdown                                   |
| 22       | 2026-11-03 | Codex         | Configure plugin caches, discovery, callouts, and wiki links                                     |
| 23       | 2026-11-03 | Codex         | Complete finalization hooks and owned Snapshot assembly                                          |
| 24       | 2026-11-03 | Codex         | Normalize logical paths, discover root licences, and deeply freeze merged configuration          |
| 25       | 2026-11-03 | Codex         | Share a compiler-owned aggregate cache through plugin contexts                                   |
| 26       | 2026-11-03 | Codex         | Document the single-invocation constraint for browser workers                                    |
| 27       | 2026-11-03 | Codex         | Remove cache scoping and delete the dedicated browser database during cleanup                    |
| 28       | 2026-11-03 | Codex         | Delegate IndexedDB database deletion to the cache adapter                                        |
| 29       | 2026-11-03 | Codex         | Extract the reusable build pipeline while preserving compiler-owned resources                    |
| 30       | 2026-11-03 | Codex         | Document the configurable filesystem loader and incremental watching                             |
| 31       | 2026-11-03 | Codex         | Document native Bun archive encoding and per-repository output                                   |
| 32       | 2026-11-03 | Akane SHIMOKA | Document Markdown parsing, metadata extraction, and optional peers                               |
| 33       | 2026-11-03 | Codex         | Document generic filesystem assets and supported header metadata                                 |
| 34       | 2026-11-03 | Codex         | Use Bun image metadata and filename MIME resolution                                              |
| 35       | 2026-11-03 | Akane SHIMOKA | Document logical identities, queued links, and translation discovery                             |
