---
id: std-publication
---

# Documentation publication standard

This standard defines how documentation is published and rendered, including access restrictions, links, assets, translations, and security. See the [standards entrypoint](./README.md).

## Rules

### Publication scope

- Documentation websites MUST publish all content in `docs/public` and its supporting assets.
- Internal documentation, standards, and reusable models MAY also be published.
- Category standards MAY define publication and access restrictions.
- Publishers MUST enforce the applicable category restrictions for documents, translations, and supporting assets.

### Markdown extensions

- Publishers MUST resolve [wikilinks](https://obsidian.md/help/links) to their targets and render [callouts](https://obsidian.md/help/callouts) as visually distinct blocks.

### Rendering rules

- Published output MUST be generated from authoritative documentation sources and MUST NOT be maintained independently.
- Links between published documents and supporting assets MUST resolve to their published locations.

### Rendering security

- Renderers MUST treat documentation and supporting assets as untrusted input.
- Imported documentation MUST NOT execute scripts, code fences, MDX, or document-supplied components.
- Raw HTML in source documents MUST be disabled. Generated HTML MUST be sanitized against an allowlist of elements, attributes, and URL schemes after transformations that could introduce unsafe markup.
- File reads and writes MUST remain within configured source and output directories, including after resolving symlinks.
- Supporting assets MUST be checked against an allowlist of supported formats. Their contents MUST be validated rather than trusting filenames or declared content types. Active content MUST be sanitized, isolated, or rejected.
- Renderers MUST enforce limits on input size and processing time.
- Before production use, renderers MUST be validated against these security requirements. Security validation failures MUST block publication.

See the [OWASP path traversal guidance](https://owasp.org/www-community/attacks/Path_Traversal), [OWASP file-handling guidance](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), and [HTML sanitization guidance](https://github.com/rehypejs/rehype-sanitize#security).

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-26 | Akane SHIMOKA | Initial draft |
