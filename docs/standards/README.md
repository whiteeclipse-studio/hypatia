---
id: std-documentation
standard_revision: 1
---

# Documentation standards
## Purpose and scope

This document is the entrypoint to the documentation standards for projects built with the Hypatia model. It defines the shared documentation structure and directs authors to the standards and reusable models for each documentation category.

Projects adopting the Hypatia model MUST follow this structure and the standards applicable to their documentation. Hypatia's `docs/standards` directory provides the basis for those conventions; adopting projects MAY reproduce that directory to extend this standard.

Documentation ownership, decision approval, maintenance, publication, copyright, and licensing MUST follow the [project governance standard](./GOVERNANCE.md).

## Copyright and licence

Copyright © 2026 White Eclipse.

This documentation standard is released under the MIT License. See the project's root [LICENCE](../../LICENCE) file for the complete licence text.

## Requirement terminology

Uppercase requirement keywords in this standard follow IETF **BCP 14**, as defined by [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and clarified by [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174).

This convention covers **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **NOT RECOMMENDED**, **MAY**, and **OPTIONAL**. Their BCP 14 meanings apply only when written entirely in uppercase; lowercase forms retain their ordinary English meanings.

## Document format and metadata

Authored documentation, including standards and reusable models, MUST use Markdown files with the `.md` extension. Supporting assets MAY use other formats.

Every document MUST begin with YAML front matter containing:

| Field | Requirement |
| --- | --- |
| `id` | A stable identifier in lowercase `kebab-case`, unique within the project; required on every authored file |
| `standard_revision` | The positive integer revision of the applicable standard, from its **Revisions** table; required on entry files only |

Category standards MAY define an identifier format and require additional metadata. A document's identifier MUST remain stable when its title or location changes. A document's own revision number MUST be recorded in its final **Revisions** section rather than in front matter; `standard_revision` identifies the governing standard revision instead.

### Applicable standards and entry files

A document's location MUST determine its category according to the placement rules in the applicable category standard. Those rules apply to nested files as well. Translations use their English source's category; package-local README entrypoints use the package documentation standard. Standards, reusable models, and other authored files outside a category's placement rules follow this shared documentation standard.

An entry file is a standalone document, such as an RFC or a single-file reference or runbook, or the main entrypoint of a documentation set, such as a design or package README. Every entry file MUST declare `standard_revision`. A missing value MUST be treated as incomplete metadata, never as an instruction to use the latest standard. For a file governed only by this shared standard, the field identifies this standard's revision.

Supporting files, including indexes for individual parts of a set, inherit the standard revision from their main entry file and do not require their own `standard_revision`. The set's navigation MUST make that entrypoint discoverable. An independently governed document within a broader tree MUST have a clearly identified entrypoint and its own pin. Translations follow their English source's standard revision; a translated entry file MUST carry the same value.

The location and pinned revision are sufficient to identify the applicable category requirements. Documents MAY link to standards for navigation, but a repeated body reference is not required. The project's standards entrypoint MUST identify the authoritative standards, directly or through their placement rules, and record the shared documentation and governance dependencies for each category revision. Those dependency bindings and access to earlier revisions MUST be preserved when newer revisions are adopted. Exact adoption references follow the [authoritative source rules](#authoritative-sources-and-links).

New standard revisions MUST NOT retroactively govern existing entry files or their supporting pages. Migrating a document set to another revision MUST be deliberate: review the complete set against the target revision, update affected content, and then change the entry file's `standard_revision`. Moving an entry file to another category MUST likewise review its applicability and update its pin. Metadata changes do not establish owner approval.

### Copyright and licence notices

Every authored Markdown document, including standards and reusable models, MUST include a **Copyright and licence** section identifying its copyright holders, applicable years, and licence. Notices MUST follow the [project's licensing rules](./GOVERNANCE.md#copyright-and-licensing).

Every documentation copyright notice MUST include a Markdown link to the project's root `LICENCE` file. Because that file is outside `docs`, a full URL to the repository file SHOULD be used, following the [link boundary rules](#authoritative-sources-and-links). A link to a generic external licence description MUST NOT replace the reference to the project's own `LICENCE` file.

### Canonical language

English MUST be the canonical language of all documentation. Every document MUST have an authoritative English source. If a translation differs from that source, the English source MUST take precedence.

### Translations

Translations MAY be provided in a single `docs/translations` directory at the project root. Each translation MUST mirror its English source's directory path relative to `docs`. Each translated file MUST be named `<filename>.<language>.md`, where `<filename>` is the source filename without its `.md` extension and `<language>` identifies the translation's language.

For example, the French translation of `docs/public/getting-started.md` resides at `docs/translations/public/getting-started.fr.md`.

Translations MUST retain their English source's public or internal classification. Their publication follows the [governance rules](./GOVERNANCE.md#documentation-publication-and-access). Links MUST resolve from the translated file's location. Translations SHOULD reuse source assets unless localized assets are needed. When an English source moves, its translations MUST move to preserve the mirrored directory path.

Every translation MUST include the following additional YAML front matter fields referencing its original English source:

| Field              | Requirement                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `source_id`        | The English source document's identifier                                                                                                    |
| `source_reference` | A canonical reference to that English source version, following the [authoritative source and link rules](#authoritative-sources-and-links) |

### Revision history

Every document, including standards and reusable models, MUST end with a **Revisions** section containing a table with **Revision**, **Date**, **Author**, and **Description** columns.

Revision numbers MUST start at 1 and increase sequentially by one. Meaningful changes MUST receive a new entry with a date in `YYYY-MM-DD` format, the author of the change, and a concise description. Existing entries MUST be preserved and their numbers MUST NOT be reused. The contents of referenced revisions MUST remain recoverable from Git history.

## Project documentation structure

Authored project documentation MUST reside in a `docs` directory at the project root, except for package-local `README.md` entrypoints permitted by the [package documentation standard](./categories/package-documentation.md#location-and-identification). The shared hierarchy separates public documentation from internal documentation, including optional project-maintained standards, and provides an optional mirrored tree for translations:

```text
docs/
├── public/
├── internal/
├── standards/    # Optional
│   ├── categories/
│   └── models/
└── translations/    # Optional; mirrors the English source tree
    ├── public/
    ├── internal/
    └── standards/
```

Each category standard MUST define where its documents reside within this hierarchy, using paths relative to the project root. The placement and filename rules below and in category standards apply to canonical English sources; translations MUST follow the [translation rules](#translations). This entrypoint defines the shared hierarchy; category-specific subdirectories are defined by their respective standards.

Publication permissions and access requirements are defined in the [project governance standard](./GOVERNANCE.md#documentation-publication-and-access).

### Public documentation

Public documentation is intended for anyone, including people outside the project. It MUST reside in `docs/public`, and its content MUST be understandable without access to internal documentation.

### Internal documentation

Internal documentation is intended for anyone with access to the project. It MUST reside in `docs/internal`, except for standards and reusable models, which reside in `docs/standards`. Internal documentation MAY reference public documentation where relevant.

This distinction describes the intended audience, independently of repository visibility. Internal documentation in a public repository remains internal documentation even though anyone can access it. Directory placement does not itself enforce access control.

### Documentation standards

Projects MAY maintain a `docs/standards` directory to define their documentation rules, extensions, and reusable models. Standards and reusable models are to be considered [Internal documentation](#internal-documentation). A project that references externally maintained standards and models is not required to reproduce them locally.

Shared standards define rules that apply across documentation categories. They MUST reside directly in `docs/standards` and use uppercase filename stems. Category standards define the purpose, required content, organization, and maintenance rules for a particular documentation category. They MUST reside in `docs/standards/categories` and use lowercase `kebab-case` filename stems.

Extensions MUST identify the standards they extend and clearly distinguish additional rules from the shared requirements. Extensions MUST preserve the mandatory requirements of the applicable standards.

#### Reusable models

Models provide authoring guidance and copyable templates. Project-maintained models MUST reside in `docs/standards/models` and use lowercase `kebab-case` filename stems. Models MAY link to the standards they support for navigation; those standards remain the authoritative source of requirements.

Derived models MUST preserve the mandatory requirements of the applicable standards. Documents and derived models MAY reference their source models; no model attribution or derivation reference is required. Additional project-specific requirements MUST be documented in the project's standards rather than introduced only through a model. Using or deriving a model is optional; compliance with the applicable standards is mandatory.

Every document created from a model MUST contain its own complete metadata and content, with placeholders replaced and relative links adjusted to its location. A model does not supply inherited values or establish approval of the resulting document.

## Documentation basis in Hypatia

Hypatia itself MUST comply with the standards it defines, including the documentation structure described in [Project documentation structure](#project-documentation-structure), the shared governance rules, and all applicable category standards.

This obligation applies to Hypatia's own documentation, standards, and reusable models. Its documents MUST satisfy the applicable content, placement, review, and maintenance requirements. Its reusable models MUST remain consistent with the standards they support.

### Standards

Hypatia's `docs/standards` directory contains the shared documentation standards for projects built with the Hypatia model.

The [documentation map](../internal/README.md) indexes Hypatia's authored documentation and describes each file's purpose.

For this draft set, revision 1 of every category listed below depends on revision 1 of `std-documentation` and revision 1 of `std-governance`. Revision 1 of `std-documentation` likewise uses revision 1 of `std-governance`. These dependency bindings remain fixed when later revisions are introduced; later bindings must be recorded separately. The category links provide their authoritative placement rules and standard identifiers.

Projects MAY reference Hypatia's standards directly or maintain local extensions following the rules above. Hypatia's standards provide the common basis; project-specific extensions MAY add requirements, guidance, or documentation categories.

#### [README](./README.md)

`README.md` is the root documentation standard and the entrypoint to the other standards. It defines the common documentation hierarchy, the roles of standards and reusable models, and the rules for project-specific extensions. Other documentation standards build on this shared foundation.

#### [Governance](./GOVERNANCE.md)

`GOVERNANCE.md` defines ownership and approval authority, documentation maintenance and publication, release and deployment reviews, and licensing. It describes the roles of the root `CODEOWNERS` and `LICENCE` files. Category standards reference these shared rules where applicable rather than redefining them.

### Categories

- [RFCs](./categories/rfcs.md): proposals, technical decisions, review, and acceptance records.
- [UI design proposals](./categories/ui-designs.md): reviewable interface designs, interaction requirements, and design decisions.
- [Public user guides and API documentation](./categories/public-documentation.md): task instructions and consumer-facing interface references.
- [Internal reference documentation](./categories/internal-reference.md): current technical facts, applicability, and authoritative sources.
- [Operational runbooks](./categories/runbooks.md): operational procedures, verification, recovery, and escalation.
- [Published package documentation](./categories/package-documentation.md): package entrypoints, detailed consumer documentation, and release validation.

### Reusable models

Hypatia's `docs/standards/models` directory provides reusable starting points for authoring documentation that follows its standards. Projects MAY use these models directly or derive their own models to include project-specific sections and guidance, following the rules above.

- [RFC document model](./models/rfc.md): authoring guidance and a copyable RFC template.
- [UI design proposal model](./models/ui-design.md): design scope, interactions, validation, and decision records.
- [User guide model](./models/user-guide.md): prerequisites, instructions, expected results, and troubleshooting.
- [API reference model](./models/api-reference.md): applicability, access, contracts, examples, errors, and limits.
- [Internal reference model](./models/internal-reference.md): current technical descriptions, constraints, verification, and sources.
- [Runbook model](./models/runbook.md): prerequisites, ordered actions, stop conditions, verification, recovery, and escalation.
- [Package documentation model](./models/package-documentation.md): installation, supported interfaces, configuration, and compatibility.

## Supporting assets

Supporting assets, such as images and diagrams, MUST reside in an `assets` directory alongside the document they belong to. Each asset filename MUST begin with the document's ID followed by a hyphen and a descriptive name.

## Authoritative sources and links

Each document MUST have one authoritative location. Other documents MUST link to that source rather than maintain duplicate copies. Summaries MAY appear elsewhere, provided they identify and link to the authoritative source. Derived models are separate documents; references to their source models are optional.

Generated publication outputs MAY reproduce canonical documentation outside `docs`, including inside published packages. They MUST be derived from the authoritative sources and MUST NOT be maintained independently. Publication MUST preserve source references and apply the link boundary rules below.

Canonical references identifying an authoritative source MUST use either a full URL to the target file or a Git file reference. A relative path alone MUST NOT serve as a canonical reference.

A Git file reference MUST identify the repository by its full URL and the target file using Git's [`<revision>:<path>` syntax](https://git-scm.com/docs/gitrevisions), with the path relative to the repository root. The repository URL and file locator MUST be recorded together; the locator alone does not identify a repository. This is a textual reference, not a standalone clickable URL.

References to an exact document version MUST use a full commit ID, either in the Git file locator or in a file URL provided by the repository host. References intended to track a maintained source MAY use a named branch; their content can change as that branch advances.

References recording the version of an adopted standard or an approved proposal MUST identify the target document's ID and revision number from its **Revisions** table, together with a canonical reference to that version.

Links authored inside `docs` SHOULD NOT use relative or root-relative paths that point outside that directory. When an outside target is required, a full URL to that target SHOULD be provided instead. Relative navigation links within `docs` SHOULD remain relative; they do not replace a canonical reference when one is required.

Relative or root-relative links pointing outside `docs` MUST remain unresolved in deployed documentation. Publication MUST NOT repair those links, rewrite them to repository URLs, or copy outside files to satisfy them. Such links MUST NOT fail a build solely because their targets are outside `docs`. Links within `docs` MUST be updated when their target documents or assets move.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-15 | Akane SHIMOKA | Initial draft |
