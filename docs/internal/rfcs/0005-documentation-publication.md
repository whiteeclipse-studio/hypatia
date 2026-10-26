---
id: rfc-0005
standard_revision: 1
status: draft
---

# rfc-0005 — Documentation publication

This RFC defines how Hypatia imports, renders, and deploys documentation from other projects.

## Proposal

### Scope

This proposal covers the `@whiteeclipse/documentation-builder` package and the website's documentation module: generating repository artifacts, loading local sources during development or downloaded artifacts, sanitizing and rendering content through shared SSR/SSG and hydrated browser paths, navigation, document notices and history, and PWA-supported offline reading.

Landing-page content, UI visual design, repository-wide engineering conventions, and content authoring rules are outside its scope. Authoring, publication, and rendering security follow the [documentation standards](../../standards/README.md).

### Documentation builder

Hypatia MUST provide a reusable `@whiteeclipse/documentation-builder` package with:

- A CLI that builds documentation artifacts from a repository's `docs` folder.
- A programmatic API and Vite plugin for integration into the website's development and build environments.
- A browser-compatible API for downloading, unpacking, validating, and rendering documentation artifacts without filesystem access or repository-specific build plugins. Imported HTML MUST be sanitized before rendering, following the [publication standard](../../standards/PUBLICATION.md#rendering-security).
- A simple plugin interface for generating or transforming files before Markdown rendering, including OpenAPI-derived API documentation, or build-time generated pages.

CLI builds and local development MUST use the same processing pipeline and configured transformations:

`Source files → custom transformations → remark/rehype → HTML, assets, and metadata`

Repository-specific plugins MUST execute in the local development or source build environment, never in the reader's browser.

The builder MUST support including the project's root `LICENCE.md` file in the documentation artifact, as an explicit exception to the `docs` source boundary.

The builder MUST rewrite source-document links to their generated output paths, including `README.md` links to `index.html`, while preserving heading fragments and valid asset references.

`AGENTS.md` files MUST remain included as rendered pages in artifacts and accessible through direct published URLs, but MUST NOT appear in navigation.

### Documentation artifacts

Each documentation artifact MUST be a gzip-compressed TAR archive (`.tar.gz`) containing all generated HTML pages and the supporting files described below. This MUST be the sole supported archive format for the builder and website, including SSG and browser loading.

Output files MUST preserve their source paths relative to `docs`, replacing `.md` with `.html` for rendered pages. Each `README.md` MUST instead become `index.html` in the same relative directory. Supporting assets MUST retain their relative paths. The root `LICENCE.md` file is an exception: it MUST be included as `LICENCE.html` at the archive root.

Each documentation artifact MUST contain:

- A `manifest.json` identifying the artifact format version, source repository, and source commit, with navigation data mapping pages and folder indexes to their routes.
- Rendered HTML for each page.
- Supporting assets.
- Complete copyright and licence notices and document revision histories embedded in each page's manifest entry, excluded from article content.

Local development, static site generation, and browser loading MUST use the same manifest and content structure, produced through the documentation builder.

#### Manifest contract

- Each page entry MUST identify the page and its HTML path and contain the complete copyright and licence notice and revision table. Notices and revision histories MUST NOT be stored only in separate files or referenced externally.
- Navigation entries MUST reference page identifiers and identify each folder's index page when present.
- The manifest MUST list the HTML, metadata, and asset files included in the artifact.
- File references MUST use paths relative to the archive root.

#### Artifact validation

The builder's artifact-loading APIs MUST validate artifacts before rendering or admitting them to the cache. Validation MUST reject malformed archives, unsupported manifest versions, missing referenced files, conflicting output paths, and archive entries or references that escape the artifact root. Extraction MUST enforce limits on expanded size and file count.

### Sources and loading

- Hypatia's publisher MUST provide public access to all published documentation, metadata, and supporting assets. The builder MUST NOT provide built-in access control; consumers MAY introduce it through plugins. This project-specific policy overrides category audience restrictions for Hypatia's publication pipeline; an internal source location MUST NOT imply restricted publication here.
- The website MUST support configured remote artifacts and local documentation directories.
- Each remote source MUST provide a user-readable artifact URL. Artifact loading MUST NOT depend on a specific hosting provider.
- Development MUST support local sources processed through the documentation builder, using the same page-rendering path as production SSG.
- Production SSG MUST consume prebuilt artifacts rather than re-parse external Markdown.
- Artifact download failures during build-time generation MUST fail the build.
- After hydration, the browser MAY download artifacts for navigation, updates, and offline storage.
- Client-side download failures MUST fall back to the corresponding build-time documentation version. That version MUST remain available to the client as a fallback.
- The browser SHOULD cache downloaded artifacts and reuse their contents and supporting assets when the requested artifact version is already cached, avoiding unnecessary downloads.
- Imported HTML MUST be sanitized before display, following the [publication standard](../../standards/PUBLICATION.md#rendering-security).
- Artifact assets and links MUST resolve consistently during SSG, browser loading, and offline use. Browser rendering MUST resolve references against the loaded artifact's paths, including cached content, rather than assume those files are hosted alongside the current page.

### Navigation and document controls

- Each project MUST be published under a distinct URL root matching its repository name, such as `/hypatia/`. Artifact paths MUST be preserved beneath that root; conflicting project roots MUST be rejected.
- Clicking a folder MUST open its index page. The README-derived index MUST represent the folder rather than appear as a duplicate navigation child.
- When a folder has no `README.md`, the builder MUST generate an `index.html` containing a table of contents for its navigable pages and subfolders and include it in the manifest.
- Generated index pages' copyright notices and revision histories MUST reside in their `manifest.json` page entries, outside the generated article body.
- Folder expansion and collapse MUST have a separate control from index navigation.
- The project switcher MUST clearly identify the current project and present clearly named choices for other projects.
- The navigation tree and main document view MUST scroll independently.
- A small © control MUST open the document's complete copyright and licence notice from the manifest, outside the article body.
- A floating revision number at the top right of the document view MUST open the complete revision table from the manifest. The displayed number MUST identify the document's own revision, not its `standard_revision`.

### Offline reading

- The website MUST support PWA offline reading by caching its application shell and validated documentation artifacts.
- Projects retained in offline storage MUST remain readable without a network connection, including navigation, supporting assets, copyright notices, and revision histories.
- The interface MUST identify the available documentation version and offline availability, and allow users to download or remove projects from offline storage.
- Cached artifacts MUST be replaced only after the new artifact is completely downloaded and validated.
- Uncached content unavailable without a connection MUST show a clear offline message.

### Build and deployment

- Publication SHOULD be triggered when configured source artifacts change and MAY be triggered manually.
- Website builds MUST emit a `build-manifest.json` listing every deployable file and the source repository and commit of each included documentation artifact. The inventory MUST be generated from the actual output and validated before deployment.
- Build generation and validation MUST complete before deployment. A failed build or interrupted deployment MUST preserve the previous complete deployment without exposing partial output.
- Defects discovered after a successful deployment MUST be corrected through a subsequent fixed build rather than rolling back the deployment.

### Consequences

Repository-produced artifacts avoid repeatedly parsing external Markdown and allow each project to generate its own documentation content. Maintaining the builder, artifact contract, and browser loader adds tooling and compatibility work; imported HTML still requires sanitization.

Public-only publication makes Hypatia unsuitable for restricted documentation. Consumers requiring access control must provide it through plugins and account for access to pages, artifacts, metadata, and assets.

SSG supplies the initial documentation snapshot, while browser downloads can provide newer versions after hydration. Offline reading reduces repeated downloads but introduces storage management and update handling. The initial generated pages remain tied to the website's last successful build.

## Alternatives considered

- **Parse all source repositories during website builds:** centralizes processing but repeats work and couples publication to each repository's generation requirements.
- **Load documentation only in the browser:** avoids including documentation in website builds but leaves its content absent from initial generated HTML.
- **Provider-specific artifact APIs:** offer hosting integrations but reduce portability compared with configured artifact URLs.
- **Separate development and production processors:** allow independent implementations but risk different content, metadata, and navigation between local preview and publication.

## Delivery and validation

Provide the builder and its CLI, programmatic API, Vite integration, and browser API. Adopt artifact generation in source repositories, then integrate artifact loading and the documentation interface into the website.

Planned checks:

- Custom generation and Markdown processing produce valid artifacts, including OpenAPI-derived content, root licence handling, preserved paths, `README.md` conversion, and rewritten links and fragments.
- TAR.GZ extraction works through the CLI and supported browsers. Manifest validation checks page and navigation mappings, embedded notices and histories, file inventories, unsupported versions, malformed archives, escaping paths, and extraction limits.
- Local development SSR and production SSG use the same rendering path. Initial HTML, hydration, browser updates, and asset resolution agree for the same artifact version.
- Folder clicks open their indexes without duplicate README entries; missing indexes produce contents pages. Project selection, independent scrolling, notice disclosures, and revision controls work. `AGENTS.md` pages remain directly reachable but absent from navigation.
- Browser caching reuses existing artifact versions. Retained projects, assets, and document metadata work offline; unavailable content is clearly identified, and download and removal controls work.
- Failed build-time downloads fail generation. Failed client downloads use the build-time version; incomplete or invalid updates do not replace usable cached artifacts. Build inventories are complete, and failed builds or deployments preserve the previous deployment.
- Imported HTML and assets satisfy the referenced publication security requirements.

## Decision record

Acceptance is pending.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-26 | Akane SHIMOKA | Initial draft |
