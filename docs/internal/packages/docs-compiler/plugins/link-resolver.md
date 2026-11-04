---
id: docs-compiler-link-resolver
parent: ./README.md
---

# Link resolver

`linkResolver()` rewrites local HAST destinations to resolved logical artifact paths and includes the targets. See
the [[../README.md|package documentation]] for coverage and [[./README.md|plugin contracts]].

## Usage

```ts
import { linkResolver } from "@whiteeclipse/docs-compiler/packages/link-resolver";

const plugins = [markdownParser(), filesystemLoader({ translations: true }), linkResolver()];
```

The resolver takes no options and follows the Markdown parser. It handles document and translation artifacts; other
values pass through unread. It requires a source resolver capable of interpreting the authored destinations. Already
serialized archives have resolved paths and normally need only archive-reader.

## Traversal and rewriting

The plugin visits string-valued `href`, `src`, `poster`, and `cite` properties in article HAST, copyright/licence HAST,
and each revision's author and description HAST. Ordinary Markdown, wiki links, reference links, and image destinations
use this same traversal.

For each local destination it separates query and fragment, decodes path URL encoding, and calls `this.resolve(path)`.
An artifact target replaces the path with `target.id.path`; the query and fragment remain authored values. For example,
`./Guide%20Name.md?lang=fr#Heading` can become `docs/guide_name.md?lang=fr#Heading`.

External schemes, protocol-relative URLs, website-root URLs, fragment-only links, query-only links, and empty values
remain unchanged. Malformed encoding, encoded absolute paths, backslashes, or encoded schemes reject transformation.
When every resolver declines, a warning is logged and the destination is preserved; resolver failures propagate.

## Dependencies and content

Resolved artifact targets are queued with non-awaiting `include()`, so self-links and mutual links are supported.
Targets complete their own loading and transformation before the repository finishes. Repeated paths share resolution
within the transform. Target content is not read by this resolver.

Rewritten article HAST receives a new immutable compiler-cache key and reusable payload descriptor. Reads return
independent trees. Rewritten metadata is copied and deeply frozen. Artifact identity and logical path are preserved.

## Boundaries

The resolver does not search document IDs, infer extensions, create heading IDs, validate fragments, associate
translations, map website routes, or sanitize rendering output. Resource lists such as `srcset` are outside this
traversal. Physical source confinement and missing-file behavior belong to the underlying source resolver.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                            |
|----------|------------|---------------|--------------------------------------------------------|
| 1        | 2026-11-03 | Akane SHIMOKA | Document logical identities and queued link resolution |
| 2        | 2026-11-04 | Akane SHIMOKA | Rebuild link rewriting and inclusion reference         |
