---
id: docs-compiler-artifacts
parent: ./README.md
---

# Artifacts

Artifacts provide metadata immediately and expose their contents through asynchronous reads. See
the [[./README.md|package documentation]] for coverage and [[./repository.md|Repository and Snapshot]] for ownership and
invalidation.

## Shared contract

```ts
interface Artifact {
    readonly path: string;
    readonly type: string;
    readonly metadata: unknown;
    readonly payload?: ArtifactPayload;
    read(): Promise<unknown>;
}

interface ArtifactPayload {
    readonly key: string;
    decode(contents: Blob): unknown | Promise<unknown>;
}
```

The compiler's `AnyArtifact` union contains the four variants below. A payload descriptor is plugin-facing and
identifies immutable content in the compiler cache; it is not an archive payload key. Watch reuse requires one for
content-bearing artifacts. Unknown artifacts may omit it.

## Logical paths

Paths use non-empty, relative, lowercase segments separated by `/`. Supported characters are ASCII letters, digits,
periods, underscores, tildes, and hyphens. Empty segments and `.` or `..` segments are invalid.

`toLogicalPath()` lowercases, converts separators, resolves relative-directory segments, and replaces unsupported
characters with underscores. It is a normalization helper, not a filesystem confinement check. Filesystem loading checks
confinement separately. Stored archive paths must already be normalized and are rejected rather than rewritten.

Paths retain source directories and extensions: `docs/Guide Name.md` becomes `docs/guide_name.md`. READMEs do not become
HTML indexes. Logical paths are independent of website routes and document IDs.

## Document

`type: "document"` reads to a Unified HAST `Root`.

| Metadata              | Representation                             |
|-----------------------|--------------------------------------------|
| `id`                  | Non-empty document identifier.             |
| `title`               | Plain string.                              |
| `navigable`           | Boolean hint for consumers.                |
| `copyrightAndLicence` | HAST root, separate from article contents. |
| `revisions`           | Ordered revision entries.                  |

Each revision has `revision` (positive integer), `date` (`YYYY-MM-DD`), `author` (HAST root), and `description` (HAST
root). The Markdown parser checks sequential revision numbering from 1 and calendar-valid dates. The archive record
schema validates individual entries but does not perform the parser's sequential-table check.

Document metadata permits extension fields. [[./plugins/markdown-parser.md|Markdown parsing]] explains extraction and
defaults; creating a document artifact does not establish authoring-standard compliance or repository-wide document-ID
uniqueness.

## Translation

`type: "translation"` also reads to a HAST root. Metadata contains `id`, `title`, `copyrightAndLicence`, and
`revisions`, plus `sourceId` identifying the canonical document and `locale` in canonical BCP 47 form. It does not
require a `navigable` field. Extension metadata is retained.

The canonical source may be absent. [[./plugins/filesystem-translations.md|Filesystem translation discovery]] validates
the `sourceId` of discovered candidates. Consumer locale selection and fallback remain separate.

## Asset

`type: "asset"` reads to a Blob. Metadata includes `mimeType` and non-negative integer byte `size`, plus any supported
resource-specific fields or JSON extensions. Images, audio, video, PDF files, and other binary inputs use this same
discriminator.

The filesystem loader can add image `width`/`height` or supported WAV `duration`. These optional fields depend on format
support. Declared MIME and byte count do not establish that an asset is safe to render.

## Unknown

`type: "unknown"` retains opaque metadata and reads to `undefined`. Its serialized form has no content or binary
payload. It can preserve an uninterpreted inventory entry without claiming a supported content representation.

## Rendering boundary

HAST and metadata are data, not approved markup. Parsing disables raw source HTML, but neither the compiler nor archive
reader sanitizes final rendering output or validates every binary format. Consumers apply
the [[../../../standards/PUBLICATION.md|publication standard]] before rendering or publishing.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                |
|----------|------------|---------------|--------------------------------------------|
| 1        | 2026-10-29 | Akane SHIMOKA | Define Artifact types and metadata schemas |
