---
id: rfc-0005
standard_revision: 1
status: draft
parent: ../../standards/README.md
previous: ./0004-internationalization.md
---

# rfc-0005 — Documentation builder

This RFC standardizes a representation of documentation authored according
to [[../../standards/README.md|Hypatia's documentation standards]]. It defines a format that documentation websites can
read and display to their users.

## Proposal

### Scope

This RFC covers the production of in-memory artifacts representing documentation for subsequent rendering.

Serialization, deserialization, and rendering of these artifacts are outside its scope.

### Context

The [[../../standards/STRUCTURE.md|structure standard]] organizes documentation under `docs`, with locations for public
and internal content, standards, translations, and assets. Repository and package READMEs and agent instructions can
reside outside `docs`.

The [[../../standards/AUTHORING.md|authoring]] and [[../../standards/TRANSLATIONS.md|translation]] standards describe
Markdown content, YAML metadata, entrypoints, notices, revision histories, and relationships to canonical English
sources. Wikilinks and callouts are supported conventions.

Projects can override standards at matching paths under `docs/standards`. Standards can extend locations and metadata;
category standards can define identifier formats. External standards and optional authoring models can be referenced.

### Proposed design

#### Logical paths

A **logical path** identifies an [[#Artifact]] within a [[#Repository]].

Logical paths MUST be relative to the Repository root and independent of source filesystem paths and website URLs. They
MUST NOT contain `.` or `..` path segments.

Logical paths MUST consist of one or more non-empty segments separated by `/`. Leading, trailing, and repeated
separators MUST NOT be used. Each segment MUST contain only lowercase ASCII letters (`a-z`), digits (`0-9`), hyphens
(`-`), periods (`.`), underscores (`_`), or tildes (`~`).

Logical paths MUST be unique within a Repository.

#### Repository

A **Repository** is the root container for a collection of documentation artifacts.

Each Repository MUST provide a stable, URL-safe identifier, a human-readable name, and a collection of artifacts
addressable by their [[#Logical paths|logical paths]].

Repositories MUST support enumeration of `(logicalPath, Artifact)` entries and direct lookup through a
`getArtifact(path)` method.

The Repository identifier MUST satisfy the restrictions for a single [[#Logical paths|logical path]] segment.

When a Repository is produced, all artifacts MUST be resolvable by their logical paths.

The Repository is responsible for reporting unknown artifact paths.

Repositories MAY carry additional metadata defined by implementations or plugins, such as source provenance.

#### Artifact

An **Artifact** represents an item within a Repository.

Each Artifact MUST provide:

- A [[#Logical paths|logical path]] identifying it within its Repository.
- A stable type identifier property identifying how its contents should be interpreted.
- A mechanism for accessing its contents.

Artifact contents SHOULD be loaded lazily.

Each Artifact MUST report failures to access its own contents. Such a failure MUST NOT be interpreted as the artifact
being absent from its [[#Repository]].

This RFC defines the [[#Standard Artifact Types|artifact types]] below. Implementations or plugins MAY define additional
types and their content representations without revising this specification, provided they satisfy its requirements.

Each artifact type MUST document its meaning and expected content representation.

Artifacts MAY carry additional metadata defined by implementations or plugins. Metadata access is
implementation-defined.

Compilation does not guarantee rendering safety for Artifact contents or HAST metadata. Rendering consumers are
responsible for applying the [[../../standards/PUBLICATION.md#Rendering security|publication security requirements]].

#### Standard Artifact Types

The HAST specification version used by `document` and `translation` artifacts is implementation-defined.

##### `unknown`

The `unknown` type represents an artifact that the pipeline could not interpret. Implementations MAY use this type to
retain such an artifact in the Repository without assigning a recognized content representation.

##### `document`

The `document` type represents documentation compiled from Markdown conforming
to [[../../standards/README.md|Hypatia's documentation standards]]. Its contents MUST be
a [HAST (Hypertext Abstract Syntax Tree)](https://github.com/syntax-tree/hast) root.

In addition to the common [[#Artifact]] properties, a `document` artifact MUST provide:

- `id`: the stable document identifier, unique within the Repository.
- `title`: the document title, represented as a simple string.
- `navigable`: a boolean indicating whether the document is included in repository navigation.
- `copyrightAndLicence`: the document's copyright and licence notice, represented as a HAST root.
- `revisions`: the document's revision history as a sequence of structured entries. Each entry MUST provide its revision
  number, date in `YYYY-MM-DD` format, author, and description, where author and description are represented as HAST
  roots.

The article contents MUST exclude the copyright and licence notice and revision history provided separately above.

Links within a `document` artifact that point to another Artifact MUST use the target
Artifact's [[#Logical paths|logical path]], resolved from the Repository root. Only the path component of the link MAY
be rewritten; its query and fragment MUST be preserved if present.

##### `translation`

The `translation` type represents a translation of a `document` artifact into another language.

Its contents MUST be a HAST root and MUST exclude the copyright and licence notice and revision history provided
separately below.

In addition to the common [[#Artifact]] properties, a `translation` artifact MUST provide:

- `id`: the stable translation identifier, unique within the Repository.
- `title`: the translated document title, represented as a simple string.
- `sourceId`: the identifier of the canonical source [[#`document`|document]] artifact, which MAY be absent from the
  Repository.
- `locale`: the translation's language, expressed as a canonical BCP 47 language tag.
- `copyrightAndLicence`: the translation's copyright and licence notice, represented as a HAST root.
- `revisions`: the translation's own revision history, using the entry structure defined for [[#`document`|document]]
  artifacts.

Links within a `translation` artifact that point to another Artifact MUST use the target
Artifact's [[#Logical paths|logical path]], resolved from the Repository root. Only the path component of the link MAY
be rewritten; its query and fragment MUST be preserved if present.

##### `image`

The `image` type represents an image resource. It MUST provide:

- `mimeType`: the resource's MIME type.
- `size`: the resource's size in bytes, expressed as a non-negative integer.

##### `video`

The `video` type represents a video resource. It MUST provide:

- `mimeType`: the resource's MIME type.
- `size`: the resource's size in bytes, expressed as a non-negative integer.

##### `audio`

The `audio` type represents an audio resource. It MUST provide:

- `mimeType`: the resource's MIME type.
- `size`: the resource's size in bytes, expressed as a non-negative integer.

##### `pdf`

The `pdf` type represents a document in Portable Document Format (PDF). It MUST provide:

- `mimeType`: the resource's MIME type.
- `size`: the resource's size in bytes, expressed as a non-negative integer.

### Consequences

Producers and consumers share a documentation model without depending on the same source-processing tools, storage
backend, or website. Standard artifact types provide common contracts, while additional types allow other content
representations.

Implementations need to map source locations to valid, unique logical paths and maintain links between artifacts. Lazy
loading reduces the need to retain all contents in memory, but consumers need to handle content-access failures
independently of artifact resolution. Interoperability for additional artifact types and implementation-selected HAST
versions depends on agreement between producers and consumers.

## Alternatives considered

- **HTML strings as the document representation:** straightforward to display, but provides less structure for
  inspecting and transforming content than HAST.
- **A closed set of artifact types:** simpler to enumerate, but would require specification changes to support other
  content representations.
- **An archive as the primary representation:** ties the shared model to serialization and transport choices, which this
  proposal leaves outside its scope.
- **Eager loading of all contents:** simplifies immediate content access, but can require retaining large resources that
  consumers never use.

## Delivery and validation

The implementation target is the `@whiteeclipse/docs-compiler` package.
The [[../packages/docs-compiler/README.md|package documentation]] is the target for documenting this implementation and
explaining how its contracts satisfy this specification.

Planned validation covers:

- Logical path and Repository identifier restrictions, path uniqueness, key-value enumeration, and `getArtifact(path)`
  lookup independently of content loading.
- Required properties and content representations for standard artifact types, including separation of article contents
  from notices and revision histories.
- Link rewriting for documents and translations, preserving queries and fragments.
- MIME types and byte sizes for resource artifacts, and reporting of content-access failures without treating artifacts
  as absent.
- Support for additional artifact types without changes to the standard type contracts.
- Consistency between the package's observable behavior, the internal reference documentation, and this specification.

The implementation remains exploratory while acceptance is pending. These checks are planned; no conformance validation
against the revised specification is claimed here.

## Open questions

## Previous items

The following is the previous draft, retained for reference. Its requirements, implementation choices, and website scope
await individual reconsideration and are not part of the rebuilt proposal above. Its decision record remains historical;
acceptance of this RFC is still pending.

### rfc-0005 — Documentation publication

This RFC defines how Hypatia imports, renders, and deploys documentation from other projects.

#### Proposal

##### Scope

This proposal covers the `@whiteeclipse/documentation-builder` package and the website's documentation module: generating repository artifacts, loading local sources during development or downloaded artifacts, sanitizing and rendering content through shared SSR/SSG and hydrated browser paths, navigation, document notices and history, and PWA-supported offline reading.

Landing-page content, UI visual design, repository-wide engineering conventions, and content authoring rules are outside its scope. Authoring, publication, and rendering security follow the [documentation standards](../../standards/README.md).

##### Documentation builder

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

##### Documentation artifacts

Each documentation artifact MUST be a gzip-compressed TAR archive (`.tar.gz`) containing all generated HTML pages and the supporting files described below. This MUST be the sole supported archive format for the builder and website, including SSG and browser loading.

Output files MUST preserve their source paths relative to `docs`, replacing `.md` with `.html` for rendered pages. Each `README.md` MUST instead become `index.html` in the same relative directory. Supporting assets MUST retain their relative paths. The root `LICENCE.md` file is an exception: it MUST be included as `LICENCE.html` at the archive root.

Each documentation artifact MUST contain:

- A `manifest.json` identifying the artifact format version, source repository, and source commit, with navigation data mapping pages and folder indexes to their routes.
- Rendered HTML for each page.
- Supporting assets.
- Complete copyright and licence notices and document revision histories embedded in each page's manifest entry, excluded from article content.

Local development, static site generation, and browser loading MUST use the same manifest and content structure, produced through the documentation builder.

###### Manifest contract

- Each page entry MUST identify the page and its HTML path and contain the complete copyright and licence notice and revision table. Notices and revision histories MUST NOT be stored only in separate files or referenced externally.
- Navigation entries MUST reference page identifiers and identify each folder's index page when present.
- The manifest MUST list the HTML, metadata, and asset files included in the artifact.
- File references MUST use paths relative to the archive root.

###### Artifact validation

The builder's artifact-loading APIs MUST validate artifacts before rendering or admitting them to the cache. Validation MUST reject malformed archives, unsupported manifest versions, missing referenced files, conflicting output paths, and archive entries or references that escape the artifact root. Extraction MUST enforce limits on expanded size and file count.

##### Sources and loading

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

##### Navigation and document controls

- Each project MUST be published under a distinct URL root matching its repository name, such as `/hypatia/`. Artifact paths MUST be preserved beneath that root; conflicting project roots MUST be rejected.
- Clicking a folder MUST open its index page. The README-derived index MUST represent the folder rather than appear as a duplicate navigation child.
- When a folder has no `README.md`, the builder MUST generate an `index.html` containing a table of contents for its navigable pages and subfolders and include it in the manifest.
- Generated index pages' copyright notices and revision histories MUST reside in their `manifest.json` page entries, outside the generated article body.
- Folder expansion and collapse MUST have a separate control from index navigation.
- The project switcher MUST clearly identify the current project and present clearly named choices for other projects.
- The navigation tree and main document view MUST scroll independently.
- A small © control MUST open the document's complete copyright and licence notice from the manifest, outside the article body.
- A floating revision number at the top right of the document view MUST open the complete revision table from the manifest. The displayed number MUST identify the document's own revision, not its `standard_revision`.

##### Offline reading

- The website MUST support PWA offline reading by caching its application shell and validated documentation artifacts.
- Projects retained in offline storage MUST remain readable without a network connection, including navigation, supporting assets, copyright notices, and revision histories.
- The interface MUST identify the available documentation version and offline availability, and allow users to download or remove projects from offline storage.
- Cached artifacts MUST be replaced only after the new artifact is completely downloaded and validated.
- Uncached content unavailable without a connection MUST show a clear offline message.

##### Build and deployment

- Publication SHOULD be triggered when configured source artifacts change and MAY be triggered manually.
- Website builds MUST emit a `build-manifest.json` listing every deployable file and the source repository and commit of each included documentation artifact. The inventory MUST be generated from the actual output and validated before deployment.
- Build generation and validation MUST complete before deployment. A failed build or interrupted deployment MUST preserve the previous complete deployment without exposing partial output.
- Defects discovered after a successful deployment MUST be corrected through a subsequent fixed build rather than rolling back the deployment.

##### Consequences

Repository-produced artifacts avoid repeatedly parsing external Markdown and allow each project to generate its own documentation content. Maintaining the builder, artifact contract, and browser loader adds tooling and compatibility work; imported HTML still requires sanitization.

Public-only publication makes Hypatia unsuitable for restricted documentation. Consumers requiring access control must provide it through plugins and account for access to pages, artifacts, metadata, and assets.

SSG supplies the initial documentation snapshot, while browser downloads can provide newer versions after hydration. Offline reading reduces repeated downloads but introduces storage management and update handling. The initial generated pages remain tied to the website's last successful build.

#### Alternatives considered

- **Parse all source repositories during website builds:** centralizes processing but repeats work and couples publication to each repository's generation requirements.
- **Load documentation only in the browser:** avoids including documentation in website builds but leaves its content absent from initial generated HTML.
- **Provider-specific artifact APIs:** offer hosting integrations but reduce portability compared with configured artifact URLs.
- **Separate development and production processors:** allow independent implementations but risk different content, metadata, and navigation between local preview and publication.

#### Delivery and validation

Provide the builder and its CLI, programmatic API, Vite integration, and browser API. Adopt artifact generation in source repositories, then integrate artifact loading and the documentation interface into the website.

Planned checks:

- Custom generation and Markdown processing produce valid artifacts, including OpenAPI-derived content, root licence handling, preserved paths, `README.md` conversion, and rewritten links and fragments.
- TAR.GZ extraction works through the CLI and supported browsers. Manifest validation checks page and navigation mappings, embedded notices and histories, file inventories, unsupported versions, malformed archives, escaping paths, and extraction limits.
- Local development SSR and production SSG use the same rendering path. Initial HTML, hydration, browser updates, and asset resolution agree for the same artifact version.
- Folder clicks open their indexes without duplicate README entries; missing indexes produce contents pages. Project selection, independent scrolling, notice disclosures, and revision controls work. `AGENTS.md` pages remain directly reachable but absent from navigation.
- Browser caching reuses existing artifact versions. Retained projects, assets, and document metadata work offline; unavailable content is clearly identified, and download and removal controls work.
- Failed build-time downloads fail generation. Failed client downloads use the build-time version; incomplete or invalid updates do not replace usable cached artifacts. Build inventories are complete, and failed builds or deployments preserve the previous deployment.
- Imported HTML and assets satisfy the referenced publication security requirements.

#### Decision record

Acceptance is pending.

#### Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

#### Revisions

| Revision | Date       | Author        | Description   |
|----------|------------|---------------|---------------|
| 1        | 2026-10-26 | Akane SHIMOKA | Initial draft |

## Decision record

Acceptance is pending.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description   |
|----------|------------|---------------|---------------|
| 1        | 2026-10-26 | Akane SHIMOKA | Initial draft |
