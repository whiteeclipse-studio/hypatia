---
id: docs-compiler-markdown-transformer
parent: ./README.md
---

# Markdown parser

`markdownParser(options?)` converts `text/markdown` assets into documents or translations with structured HAST and
metadata. See the [[../README.md|package documentation]] for coverage and [[./README.md|plugin contracts]].

## Usage and options

```ts
import { markdownParser } from "@whiteeclipse/docs-compiler/packages/markdown-parser";

const parser = markdownParser({
    wikilinks: true,
    callouts: true,
    headings: {
        copyrightAndLicence: ["Droits d’auteur et licence"],
        revisions: ["Révisions"],
    },
});
```

Bun is required because front matter uses `Bun.YAML.parse()`. The package export is disabled for browser and non-Bun
runtimes. Configuration is copied and deeply frozen.

`wikilinks` and `callouts` default to `false` in the programmatic API; the CLI enables both by default. The
`remark-wiki-link@2.0.1` and `@r4ai/remark-callout@0.6.2` extensions are regular package dependencies and are imported
only when enabled. Wiki links preserve authored destinations and labels. Callouts support custom types, including
`outline`, without generating a table of contents.

`headings` supplies additional localized labels; English defaults remain recognized. Matching ignores case and inline
formatting.

## Pipeline

The parser handles assets whose MIME base type is `text/markdown`, including MIME parameters. Repositories and other
artifact types pass through unread. It reads the asset, parses front matter and GFM Markdown through Unified/Remark,
disables raw source HTML, and converts article content to HAST. Front matter must be a YAML mapping.

Place it before the filesystem loader when enabling translation discovery:

```ts
const plugins = [markdownParser(), filesystemLoader({ translations: true }), linkResolver()];
```

The loader's `load` hook runs before any transform, so the parser can precede that loader in plugin order. Without
translation discovery, either order supplies Markdown to the parser; the link resolver follows it.

## Metadata

| Field                 | Extraction                                                                                                                        |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| `id`                  | Front matter `id`, otherwise logical path.                                                                                        |
| `title`               | Plain text of the first top-level H1, otherwise logical path; the H1 remains in the article.                                      |
| `copyrightAndLicence` | Contents of the matching metadata section without its heading. Missing section gives an empty HAST root.                          |
| `revisions`           | Four-column table interpreted as Revision, Date, Author, Description. Missing section gives an empty array.                       |
| `navigable`           | Documents: explicit front matter boolean, otherwise true except `AGENTS.md`, `LICENCE`, and `LICENSE` (including `.md` variants). |

Front matter fields are retained as metadata extensions; computed fields take precedence. Metadata sections and their
headings are removed from article content. A section ends at the next heading of equal or shallower depth. Repeated
sections are all removed, with the last occurrence used as metadata.

A non-empty revision section must contain a single four-column table with at least one data row. Numbers start at 1 and
increase sequentially; dates must be valid calendar dates. Author and description retain formatted HAST, including
links. Column positions determine meaning independently of localized header labels.

Presence of `source_id` produces a translation. `sourceId` copies that field; locale comes from explicit `locale` or the
`<filename>.<language>.md` suffix and is canonicalized as BCP 47. Missing or invalid translation metadata rejects
transformation. Other Markdown produces a document.

## Content and boundaries

Article HAST is JSON stored under a fresh compiler-cache key. Reads return independent trees, and missing payloads fail
without rereading newer source bytes. Metadata is copied and deeply frozen. The logical path is preserved.

The parser does not resolve links, look up canonical translations, enforce repository-wide IDs, resolve inherited
standards, or check complete authoring compliance. Plain Markdown and licence files can produce documents using
defaults. Rendering and publication sanitization remain consumer responsibilities.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                                                                      |
|----------|------------|---------------|--------------------------------------------------------------------------------------------------|
| 1        | 2026-10-30 | Akane SHIMOKA | Draft Markdown-to-HAST conversion and optional logical-path link resolution                      |
| 2        | 2026-11-02 | Akane SHIMOKA | Add document navigation links                                                                    |
| 3        | 2026-11-03 | Akane SHIMOKA | Document Markdown artifacts, optional extensions, and metadata extraction                        |
| 4        | 2026-11-04 | Akane SHIMOKA | Rebuild parser options, ordering, and metadata reference; default licence files to non-navigable |
| 5        | 2026-11-04 | Akane SHIMOKA | Document included syntax extensions and CLI defaults                                             |
