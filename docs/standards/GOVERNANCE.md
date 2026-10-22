---
id: std-governance
standard_revision: 1
---

# Project governance standard
## Purpose

This standard defines the shared rules for project ownership, decision authority, amendments to documentation and governance standards, documentation maintenance and publication, software versioning, release and deployment review, and documentation copyright and licensing for projects adopting it.

Documentation category standards MUST follow the governance revision bound to them in the project's standards entrypoint. Explicit body references MAY be provided for navigation. Category standards MAY add requirements specific to their documents, but MUST NOT redefine the project's ownership or licensing rules.

`CODEOWNERS` and `LICENCE` are root-level governance files. Documentation describing their use resides in `docs`.

## Copyright and licence

Copyright © 2026 White Eclipse.

This documentation standard is released under the MIT License. See the project's root [LICENCE](../../LICENCE) file for the complete licence text.

## Requirement terminology

Uppercase requirement keywords in this standard follow IETF **BCP 14**, as defined by [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and clarified by [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174).

This convention covers **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **NOT RECOMMENDED**, **MAY**, and **OPTIONAL**. Their BCP 14 meanings apply only when written entirely in uppercase; lowercase forms retain their ordinary English meanings.

## Project ownership and decision authority

Every project MUST maintain one authoritative `CODEOWNERS` file at its repository root. This file defines responsibility for project files and the authority to approve decisions affecting them.

The file MUST include:

- A default `*` rule identifying the project owners.
- Ownership of `/CODEOWNERS` assigned to those project owners.
- Ownership of `/LICENCE` assigned to those project owners.

Projects MAY add rules delegating responsibility for specific areas to other individuals or teams. For example, a `/docs/internal/rfcs/` rule MAY delegate RFC decision authority.

Owner identifiers MUST resolve to identifiable individuals or teams on the project's repository hosting platform. Named owners MUST have the access required to review and approve changes.

The effective owners of a file are the decision makers for that file. When responsibility has not been delegated, it falls to the default project owners. Projects MUST account for their hosting platform's pattern precedence when defining these rules.

Ownership delegated over an RFC file includes authority over the decision recorded in it, even when that decision affects other areas. Decisions reserved by this standard to project owners remain subject to that requirement.

Other owners whose areas are affected SHOULD be consulted before a decision.

Changes to project ownership or delegated decision authority MUST be approved by an existing project owner, using the ownership configuration in effect before the proposed change.

Repository review rules SHOULD enforce owner approval where the hosting platform supports it. Category-specific decision records remain mandatory regardless of automated enforcement.

## Changes to documentation and governance standards

Changes to `docs/standards/README.md` and `docs/standards/GOVERNANCE.md` MUST receive explicit approval from an existing project owner under the ownership configuration and governance rules in effect before the change. Approval of these amendments MUST NOT be delegated to other file owners. The approval MUST be recorded with the associated change or review.

Every update to either standard MUST increment its revision number by adding an entry to its **Revisions** table, following the [shared revision rules](./README.md#revision-history). An RFC is not required to amend either of these two standards.

## Documentation maintenance

Documentation MUST be updated whenever project changes affect its accuracy or completeness. The responsible owners MUST ensure these updates are reviewed under the project's ownership rules, even when no release or deployment is planned. Documentation-only changes MUST follow the same ownership and review rules.

## Documentation publication and access

Documentation websites MUST publish all content from `docs/public` and its supporting assets.

Documentation websites MAY also publish internal documentation, including standards, reusable models, and supporting assets. When the source project restricts access to this content, the website MUST enforce the project's access restrictions for both the documentation and its supporting assets, except for package documentation governed by the package audience rule below.

Documentation published with or for a package MUST be accessible to the same audience as the package itself. Public packages MUST have publicly accessible documentation; documentation for restricted packages MUST have matching access restrictions. This applies to package-local entrypoints, detailed documentation, translations, and supporting assets. Package consumers MUST NOT need access to the source repository to read the published documentation. The package audience governs this publication even when the source repository has different visibility.

Published translations and their supporting assets MUST follow the same publication and access restrictions as their English source.

### Proposed amendment: documentation rendering security

This amendment is pending explicit project-owner approval. Its requirements describe the proposed publication policy and MUST NOT be represented as approved by the act of drafting them. It does not change revision 1's existing dependency bindings.

Documentation renderers MUST treat imported Markdown and supporting assets as untrusted input, including content from the project's own public repositories. Executable code, renderer configuration, and processing plugins MUST remain under the publishing application's control. Imported documentation MUST NOT execute repository scripts, code fences, MDX, or document-supplied components.

#### Markdown and HTML

Raw HTML, embedded scripts, iframes, and document-supplied styles MUST be disabled. Code fences MUST be rendered as text. Generated article HTML MUST be sanitized against a reviewed allowlist of elements, attributes, and URL protocols after transformations that could introduce unsafe markup. Sanitizer configuration MUST preserve protection against document IDs or names interfering with application globals; generated heading links and tables of contents MUST use the resulting identifiers.

For remark/rehype implementations, `remark-rehype` MUST leave raw HTML disabled, and `rehype-sanitize` MUST sanitize the generated article tree. Its default schema SHOULD be the starting point; extensions MUST be limited to explicitly supported documentation features. The upstream [conversion security guidance](https://github.com/remarkjs/remark-rehype#security) and [sanitization guidance](https://github.com/rehypejs/rehype-sanitize#security) explain these boundaries.

#### Links, paths, and assets

Renderers MUST validate links independently of filesystem paths. Supported destinations MUST be limited to relative documentation links, fragments, HTTPS URLs, and explicitly supported additional schemes such as `mailto:`. Executable URL schemes MUST be rejected. Local paths and symlinks used to read or copy files MUST resolve within the imported source tree; output paths MUST remain within the designated output tree and MUST NOT overwrite application-owned files. Links pointing outside `docs` follow the [shared link boundary rules](./README.md#authoritative-sources-and-links); retaining an unresolved link MUST NOT cause its target to be read or copied.

Supporting assets MUST follow an explicit allowlist of supported formats. SVG assets MUST be sanitized and displayed through image elements rather than embedded inline. Their delivery MUST also prevent script execution when opened directly, through isolation or restrictive response policies. Unsupported active content MUST be rejected or delivered as an isolated download; copying an asset MUST NOT bypass these controls. [SVG image restrictions](https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/SVG_as_an_image) do not apply identically to every embedding or navigation context.

#### Build isolation and browser protection

Builds MUST fetch documentation only from configured repositories and MUST NOT automatically download URLs found in documents. The processing stage MUST enforce documented limits on input sizes and processing time and MUST NOT receive deployment credentials. Publication MUST be a separate stage consuming validated build output.

Published websites MUST enforce a Content Security Policy restricting executable scripts to application-controlled code and blocking objects and unauthorized framing. The policy MUST explicitly bound permitted resource origins. [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) supplements sanitization and MUST NOT replace it.

#### Validation

Before production use, validation MUST cover malicious URL schemes, event-handler injection, SVG scripts, filesystem traversal, symlink escapes, and oversized inputs, alongside supported documentation features. Security validation failures MUST block publication. Planned checks MUST remain distinguishable from executed checks and their recorded results.

## Software versioning

Software versions MUST follow the scheme appropriate to the released artifact:

| Artifact                          | Scheme                                                                                             | Examples                                  |
| --------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Application or product release    | Calendar versioning: `YYYY.RELEASE.PATCH[-prerelease]`                                             | `2027.1.0`, `2027.2.1`, `2027.3.0-beta.1` |
| Reusable package, library, or SDK | [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html): `MAJOR.MINOR.PATCH[-prerelease]` | `1.4.2`, `2.0.0-rc.1`                     |

The scheme follows the artifact's role rather than its distribution mechanism. An application distributed through a package registry MAY retain its calendar release label; reusable packages consumed as dependencies MUST follow Semantic Versioning. If one artifact serves both roles, its dependency-facing version MUST follow Semantic Versioning; a calendar product label MAY be maintained separately. Document revision numbers are separate from these software versions.

### Application and product releases

`YYYY` MUST identify the year of the feature release. Pre-releases MUST use the intended year of the stable release. `RELEASE` MUST start at 1 for each year and increase for each new feature release. `PATCH` MUST start at 0 for each feature release and increase for bug-fix updates. A new feature release MUST reset `PATCH` to 0.

Maintenance updates MUST retain their release line's year and release number, even when published in a later calendar year. For example, a maintenance update to `2027.2.0` published in 2028 would be `2027.2.1`; the first new feature release of 2028 would be `2028.1.0`.

Applications exposing APIs, plugin interfaces, or data formats MUST document their compatibility policies independently of the calendar release label. Those contracts MUST have explicit versions when consumers need to distinguish incompatible forms.

### Reusable packages

Packages MUST declare their supported public interface and follow Semantic Versioning 2.0.0. For major versions greater than zero, incompatible changes increment `MAJOR`, compatible additions or deprecations increment `MINOR`, and compatible bug fixes increment `PATCH`. Initial development MAY use `0.y.z` under the specification's development rules. Component resets, identifier syntax, and version precedence MUST follow the specification.

Package versions MAY evolve independently of application release labels and other packages. Each application or product release MUST identify the versions of the reusable packages it includes, either in its release record or through an associated build manifest.

### Pre-releases and RFC acceptance

Application and package releases implementing proposals governed by unaccepted RFCs MUST include a pre-release identifier. The requirement applies to the RFCs governing the released behaviour, taking accepted replacements and the scope of partial supersession into account.

Pre-release syntax and precedence in both schemes MUST follow Semantic Versioning 2.0.0. Identifiers such as `alpha.1`, `beta.1`, and `rc.1` MAY be used. Optional build metadata MAY be appended using the specification's syntax. A development version such as `0.1.0`, or build metadata alone, MUST NOT substitute for the required pre-release identifier.

A pre-release identifier MUST NOT be treated as RFC acceptance or authorization for production work. Exploratory work and production implementation remain subject to the [RFC acceptance requirements](./categories/rfcs.md#when-an-rfc-is-required).

### Published version integrity

Published application and package artifacts MUST NOT be modified or replaced under an existing version number. Corrections MUST be published under a new version. This requirement also applies to published pre-release versions.

## Documentation review during release and deployment

Projects adopting this standard MUST include documentation review as a required step in their release and deployment processes. Before a release or deployment, reviewers MUST confirm that documentation affected by the changes is accurate, reflects the behaviour being released or deployed, and meets the applicable documentation standards. Required documentation updates MUST be completed before the release or deployment.

The review MUST follow the project's ownership rules. Its outcome MUST be recorded with the associated change, release, or deployment, including when no documentation updates are required. A review performed earlier in the delivery process MAY satisfy this requirement, provided it covers the version being released or deployed.

## Copyright and licensing

Every project MUST maintain a file named `LICENCE` at its repository root containing the complete licence text applicable to its documentation.

Copyright and licence notices MUST agree with the root `LICENCE` file and follow the [shared notice format](./README.md#copyright-and-licence-notices). The complete licence text MUST be maintained in that file rather than duplicated in individual documents.

Hypatia's documentation standards and reusable models are released under the MIT License. Redistributed or derived copies MUST retain the copyright and permission notices required by that licence.

Changes to a project's documentation licence MUST be approved by an existing project owner under the ownership rules above.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-15 | Akane SHIMOKA | Initial draft |
