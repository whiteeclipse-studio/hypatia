---
id: std-authoring
---

# Documentation authoring standard

This standard defines the shared requirements for writing documentation, including document format, metadata, required notices, revision history, and source references. See the [standards entrypoint](./README.md).

## Rules

### Requirement terminology

In all files covered by this standard, uppercase requirement keywords follow **BCP 14**, as defined by [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174). These meanings apply only to fully uppercase keywords; lowercase forms retain their ordinary meaning.

### Writing style

- Authors MUST avoid duplicating information documented elsewhere. Restrictions imposed by a standard MUST NOT be repeated in other files.
- Authors SHOULD use plain, concise language, explain unfamiliar terms, and keep each paragraph focused on one idea.
- Authors SHOULD use headings, lists, and tables when they make information easier to scan.

### Document format

- Documentation MUST use Markdown files with the `.md` extension.
- Supporting assets MAY use other formats.
- Internal links MAY use Obsidian-style [wikilinks](https://obsidian.md/help/links), with an optional heading and display text.
- Documentation MAY use Obsidian-style [callouts](https://obsidian.md/help/callouts), with a type, optional title, and blockquoted content.

### Metadata

Every document MUST begin with YAML front matter. The following fields are REQUIRED where indicated:

| Field               | Required on | Value                                                                                           |
| ------------------- | ----------- | ----------------------------------------------------------------------------------------------- |
| `id`                | Every file  | A stable, project-unique identifier in lowercase `kebab-case`.                                  |
| `standard_revision` | Entry files | A positive integer identifying a revision in the [standards entrypoint](./README.md#revisions). |

- Entry files are standalone documents or the main entrypoints of independently governed documentation sets. A folder-based set's main entrypoint MUST be its `README.md`.
- Files without `standard_revision` MUST belong to the nearest enclosing `README.md` that declares one and inherit its standard revision. Lookup MUST start in the file's directory and continue through parent directories, excluding the file itself.
- Supporting files, including README indexes within a set, do not require their own `standard_revision`.
- Supporting files MUST link to their entrypoint. This link SHOULD appear in the summary immediately below the title.
- A document's `id` MUST remain unchanged when its title or location changes.
- Category standards MAY define identifier formats and require additional metadata.
- A document's own revision MUST be recorded in its Revisions table, not in front matter.

### Standard applicability

- A canonical English source's location MUST determine its category standard. Documents outside a category MUST follow the shared standards. Translations MUST follow the [translation standard](./TRANSLATIONS.md) instead of category standards.
- A missing required `standard_revision` MUST be treated as incomplete metadata, never as adoption of the latest revision.
- New standard revisions MUST NOT apply retroactively. Changing a document's category or revision pin MUST follow a review and update of the complete affected documentation set.
- Each revision of the standards entrypoint MUST identify the shared and category standard revisions it adopts. Earlier bindings MUST remain available.

### Required notices

- Documents MUST include a **Copyright and licence** section identifying the copyright holders, applicable years, and licence, with a link to the canonical licence text.
- A **Requirement terminology** section MAY be included where appropriate. Category standards MAY require this section.

### Revision history

- Documents MUST end with a **Revisions** section containing a table with **Revision**, **Date**, **Author**, and **Description** columns.
- Revision numbers MUST start at 1 and increase by one for each new entry.
- Meaningful changes MUST be recorded in a revision entry.
- Dates MUST use the `YYYY-MM-DD` format.
- The description MUST be as short as possible and summarize the update without listing every individual change.
- Existing entries MUST be preserved, and revision numbers MUST NOT be reused. Referenced revision contents MUST remain recoverable from Git history.

### Sources and links

- Each document MUST have one authoritative location. Other documents MUST link to it rather than maintain duplicate copies.
- Navigation links within `docs` MUST use relative paths or wikilinks. Links to targets outside `docs` SHOULD use full URLs.
- Canonical source references MUST use full URLs to the target files.
- Links MUST be updated when their target documents or assets move.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-26 | Akane SHIMOKA | Initial draft |
