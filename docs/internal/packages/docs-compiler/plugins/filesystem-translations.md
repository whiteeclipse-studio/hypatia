---
id: docs-compiler-translations-loader
parent: ./README.md
---

# Filesystem translation discovery

`filesystemLoader({ translations: true })` includes translations related to parsed canonical documents. See
the [[../README.md|package documentation]] for coverage and [[./filesystem-loader.md|filesystem loading]] for source
selection.

## Ordering

```ts
const plugins = [markdownParser(), filesystemLoader({ translations: true }), linkResolver()];
```

The option defaults to `false`. When enabled, a raw Markdown asset in a canonical documentation location rejects with an
ordering error if the loader's transform sees it before parsing.

## Candidate paths

Canonical files beneath `docs/`, excluding `docs/translations/`, map to mirrored directories under `docs/translations/`.
For `docs/public/Guide.md`, candidates include `docs/translations/public/Guide.fr.md`. Discovery uses original physical
filename spelling, not the normalized logical path.

Candidates are regular files named `<source-stem>.<language>.md`; the language component must be non-empty and contain
no period. Explicit exclusions apply. Symbolic links are not admitted. Related candidates can be included even though
automatic discovery skips the translations subtree.

Root licence files and canonical files outside `docs/` do not participate in mirrored discovery. Documents included
through links can discover their translations. Missing candidate directories produce no translations.

## Inclusion and association

After the canonical document is parsed, discovery resolves and queues candidates through the normal artifact pipeline
without awaiting their transforms. This avoids introducing recursive loading cycles. Parsing determines each candidate's
locale and translation metadata.

At `buildEnd`, every discovered candidate must exist as a translation and declare the canonical document's `id` as its
`sourceId`. Missing, unparsed, or mismatched candidates reject the build. A candidate discovered for conflicting
canonical IDs also rejects.

This check covers discovered associations. It does not enforce global document or translation ID uniqueness, translation
freshness, required language coverage, inherited standard pins, or consumer locale fallback.

## Watching

Discovery registers a dependency on a translations catalog serviced by the repository's native watcher. Adding,
removing, or renaming candidates invalidates discovery, including when a canonical document gains its first translation.
The compiler retains the previous snapshot when rebuilding fails.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                             |
|----------|------------|---------------|---------------------------------------------------------|
| 1        | 2026-11-03 | Akane SHIMOKA | Draft filesystem translation discovery and validation   |
| 2        | 2026-11-04 | Akane SHIMOKA | Rebuild translation selection and association reference |
