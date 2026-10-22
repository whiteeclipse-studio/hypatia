---
id: std-ui-designs
standard_revision: 1
---

# UI design proposal standard
## Purpose and scope

UI design proposals describe intended user experiences, visual foundations, screens, components, and interactions. They make a design reviewable before implementation and preserve the rationale and approved revision. They do not substitute for technical RFCs or descriptions of delivered behaviour.

These documents MUST follow the [root documentation standard](../README.md) and the [project governance standard](../GOVERNANCE.md). Shared metadata, English sources, translations, supporting assets, copyright notices, revision histories, ownership, and publication rules apply without being redefined here.

## Copyright and licence

Copyright © 2026 White Eclipse.

This documentation standard is released under the MIT License. See the project's root [LICENCE](../../../LICENCE) file for the complete licence text.

## Requirement terminology

Uppercase requirement keywords in this standard follow IETF **BCP 14**, as defined by [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and clarified by [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174).

This convention covers **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **NOT RECOMMENDED**, **MAY**, and **OPTIONAL**. Their BCP 14 meanings apply only when written entirely in uppercase; lowercase forms retain their ordinary English meanings.

## Location and identification

Canonical proposals MUST reside under `docs/internal/designs/<id>/`, with a main `README.md` as the entrypoint. The directory name MUST equal the main README's stable lowercase kebab-case identifier, such as `design-navigation`. Proposals are internal documentation regardless of repository visibility.

Every authored file MUST have its own project-unique `id`, copyright notice, and final revision history. Supporting documents inherit `standard_revision` from the main README and require no category-specific front matter. Supporting assets MUST follow the [shared asset rules](../README.md#supporting-assets), including location alongside their owning document and filenames prefixed with that document's ID.

## Metadata and lifecycle

Only the main README MUST include `status` in addition to the shared entry-file metadata. It records the lifecycle of the complete proposal; supporting files MUST NOT maintain separate proposal statuses or decision records. Valid values are:

| Status | Meaning |
| --- | --- |
| `draft` | Being prepared or discussed; not approved |
| `accepted` | An identified design revision and its supporting documents have been approved |
| `rejected` | Reviewed and declined |
| `retracted` | Withdrawn or retired without an accepted replacement |
| `superseded` | Replaced by an accepted design proposal |

Acceptance is a design decision, not evidence of implementation, validation, or release. Prototype and implementation progress MUST be described separately from this lifecycle.

## Documentation organization

Every proposal MUST include a main README and separate documentation for **inspirations**, **mockups**, and **implementation rules**. The README MUST index these three parts. They MUST NOT be replaced solely by inline README sections or external design links.

| Document | Default location within the proposal directory | Purpose |
| --- | --- | --- |
| Main README | `README.md` | Proposal scope, navigation, validation, open questions, lifecycle, and decision record. |
| Inspirations | `inspirations.md` or `inspirations/README.md` | Sources, rationale, and the intended design direction. |
| Mockups | `mockups.md` or `mockups/README.md` | Reviewable visual samples and explanations of screens, states, and interactions. |
| Implementation rules | `implementation-rules.md` or `implementation-rules/README.md` | Building blocks, concrete values, behaviour, and implementation constraints for the target platform. |

Every part, including detailed material supporting the main README, MAY be split across multiple linked Markdown files. A split part MUST have an entrypoint explaining its organization and linking to its pages. The main README MUST remain the proposal entrypoint and retain its status, documentation index, open questions, and decision record. Other required README sections MAY summarize and link to detailed pages rather than duplicate their contents.

Files other than `README.md` MUST use descriptive lowercase kebab-case stems. Supporting pages MUST provide navigation back to their part's entrypoint or the main README. Split pages MAY use subject-specific headings; the complete part MUST cover its required content, and each authored page MUST retain the shared metadata, notice, and revision requirements.

Inspirations explain the direction; mockups illustrate its application; implementation rules define precise values and behaviour. Illustrative approximations in samples MUST be identified. Conflicts between these parts MUST be resolved before acceptance rather than left to implementers to interpret.

## Document types

The following profiles define separate documents, not successive sections of one README. Each entrypoint MUST include its listed sections in order; detail SHOULD be proportionate to the design's scope. A section with no applicable content MUST say so explicitly. An authored file using uppercase normative keywords MUST include the BCP 14 declaration and RFC 2119 and RFC 8174 links from this standard's **Requirement terminology** section, after its copyright notice.

### Main README

Default location: `README.md`.

| Section                    | Required content                                                                                                                                                                        |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Summary**                       | Summarize the interface proposal and intended user benefit.                                                                                                                                                                                                                                                                                                                                                                                      |
| **Copyright and licence**  | Follow the [shared notice format](../README.md#copyright-and-licence-notices) and [licensing rules](../GOVERNANCE.md#copyright-and-licensing), including the project-root licence link. |
| **Requirement terminology**       | Include the BCP 14 declaration and RFC links defined above for normative interface requirements.                                                                                                                                                                                                                                                                                                                                                 |
| **Context and scope**             | Describe the current experience, intended users, constraints, affected surfaces, and exclusions. Link to related RFCs and existing foundations.                                                                                                                                                                                                                                                                                                  |
| **Documentation index**           | Link to the inspirations, mockups, and implementation rules entrypoints. Explain how to find any additional detailed pages.                                                                                                                                                                                                                                                                                                                      |
| **User journeys**                 | Describe entry points, user roles, actions, navigation, outcomes, and recovery paths. Link to supporting flows and samples; do not introduce authorization decisions implicitly.                                                                                                                                                                                                                                                                 |
| **Consequences and alternatives** | Explain usability and implementation tradeoffs, reuse, deviations from existing foundations, maintenance costs, and credible alternatives, including retaining the current experience where relevant.                                                                                                                                                                                                                                            |
| **Validation**                    | Define observable review criteria across the entire set, including interactions and accessibility. Distinguish planned checks, completed checks, and prototype observations; none alone establishes implementation or acceptance.                                                                                                                                                                                                                |
| **Open questions**                | List unresolved choices and resolution conditions, or state that none remain. Material design questions MUST be resolved before acceptance; deferred details MUST have recorded boundaries and resolution conditions.                                                                                                                                                                                                                            |
| **Decision record**               | State that acceptance is pending for a draft. Acceptance MUST identify the approving individuals, date, approved README revision, approval reference, conditions, and the full reviewed set as defined in [Review and maintenance](#review-and-maintenance). Rejection or retraction MUST record the responsible individuals, date, reason, and approval reference. Link an accepted replacement on supersession and preserve earlier decisions. |
| **Revisions**                     | End with the history required by the [shared revision rules](../README.md#revision-history).                                                                                                                                                                                                                                                                                                                                                     |

### Inspirations

Default location: `inspirations.md`.

| Section                    | Required content                                                                                                                                                                        |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Overview**              | Describe the intended mood, identity, experience, and aspects explored by this document or its linked pages.                                                                                                                                                |
| **Copyright and licence** | Follow the shared notice and licensing rules, including the project-root licence link.                                                                                                                                                                      |
| **Sources**               | Identify inspiration sources and their creators or publishers where known, with references and representative material where useful. Explain the specific qualities drawn from each source and identify attribution or reuse restrictions where applicable. |
| **Design direction**      | Explain the intended composition, typography, palette, imagery, material, or motion principles and their rationale. Link to mockups and implementation rules that apply these ideas.                                                                        |
| **Boundaries**            | Describe what should not be carried over from the sources, deliberate deviations, and illustrative or exploratory elements. Concrete implementation requirements belong in the implementation rules rather than being maintained independently here.        |
| **Revisions**             | End with the shared numbered revision history.                                                                                                                                                                                                              |

A moodboard MAY use linked images, annotated references, or grouped collections of inspiration. Source references MUST distinguish external inspiration from original proposed design material. Sources alone MUST NOT replace an explanation of how they inform the proposal.

### Mockups

Default location: `mockups.md`.

| Section                    | Required content                                                                                                                                                                        |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Overview**                | Identify the journeys, surfaces, and design aspects illustrated, and link to the inspirations and implementation rules.                                                                                                                                                                |
| **Copyright and licence**   | Follow the shared notice and licensing rules, including the project-root licence link.                                                                                                                                                                                                 |
| **Samples**                 | Provide visual samples as repository assets with descriptive text and captions. Identify each sample's surface, state, relevant display or device context, and theme where applicable. Explain layout, content hierarchy, and illustrative text, data, or visual approximations.       |
| **Interactions and states** | Describe user actions, transitions, outcomes, and recovery, including relevant default, loading, empty, success, error, disabled, and permission states. Link to samples and rules; identify states not depicted or not applicable. Storyboards MAY illustrate motion and transitions. |
| **Adaptations**             | Show or describe relevant variations across supported screen sizes, input methods, themes, languages, and long content. Identify omissions and limitations. Comparable visual variants SHOULD be presented together to support review.                                                 |
| **Revisions**               | End with the shared numbered revision history.                                                                                                                                                                                                                                         |

Mockups MUST include reviewable visual samples, such as wireframes, rendered concepts, annotated screenshots, or storyboard frames. Reviewers MUST be able to understand the proposal from its Markdown and repository assets. External tools and interactive prototypes MAY supplement this material, but an external link alone is insufficient. Samples and prototype observations MUST distinguish intended design from verified delivered behaviour; provisional motion or approximate values MUST NOT imply a final implementation specification.

### Implementation rules

Default location: `implementation-rules.md`.

| Section                    | Required content                                                                                                                                                                        |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Overview**                      | Identify the implementation scope, established target platforms or technologies, existing foundations, and relevant constraints. Distinguish confirmed choices from unresolved ones.                                                                                                                  |
| **Copyright and licence**         | Follow the shared notice and licensing rules, including the project-root licence link.                                                                                                                                                                                                                |
| **Requirement terminology**       | Include the BCP 14 declaration and RFC links defined above for normative interface requirements.                                                                                                                                                                                                      |
| **Building blocks**               | Catalogue reusable elements, such as components, native views, widgets, controls, or templates. Describe their responsibilities, composition, variants, states, inputs, outputs, and reuse of existing elements where applicable. Link to the corresponding samples and detailed rules.               |
| **Visual rules**                  | Specify authoritative typography, colours, spacing, sizing, layout, borders, depth, imagery, and motion values or constraints where applicable. Give units, meaningful names, relationships, adaptation rules, and state or theme variations. Distinguish required values from illustrative examples. |
| **Interaction and accessibility** | Specify behaviour, state transitions, feedback, navigation, focus, keyboard or other input support, semantic structure, labels, contrast, reduced motion, and relevant localization or content constraints. Identify platform-specific adaptations and concerns that do not apply.                    |
| **Verification**                  | Define observable checks for compliance with the rules, linked to samples and README validation criteria. Identify prerequisites and distinguish planned methods from executed checks and their evidence.                                                                                             |
| **Revisions**                     | End with the shared numbered revision history.                                                                                                                                                                                                                                                        |

Implementation rules MUST suit the project's actual target platform and MUST NOT assume TypeScript, React, CSS, or a browser. Web projects MAY provide React component catalogues and CSS properties or custom properties; native, desktop, terminal, or other interfaces MAY use their own controls, style resources, layout measures, and platform conventions. Platform-independent constraints MUST remain understandable without a particular programming language. When technology choices are unresolved, the document MUST state the boundary and describe design requirements without silently selecting a stack. Technical decisions requiring an RFC remain subject to the RFC standard.

The implementation rules are authoritative for exact values and required behaviour; mockups MAY approximate them only where that approximation is explicitly identified. Existing authoritative foundations SHOULD be linked rather than copied. Unresolved values or behaviours MUST be tracked in the main README's open questions under its acceptance rules.

## Review and maintenance

Acceptance, rejection, and retraction MUST receive explicit approval under the project's ownership rules. Approval MUST cover a numbered main README revision and the complete reviewed set of supporting documents and assets. The decision record MUST list covered document IDs and revisions and include a canonical reference to a fixed repository snapshot containing their sources and assets, following the [shared exact-version reference rules](../README.md#authoritative-sources-and-links). Adding or splitting files MUST NOT implicitly extend an earlier approval to unreviewed material. Drafts and mockups MUST NOT imply acceptance.

Production work based on a UI design proposal MUST follow an accepted design revision. Exploratory prototypes MAY precede acceptance.

Meaningful updates MUST receive new revision entries. Changes to any part of an accepted design set, including supporting pages or assets, MUST receive renewed approval before being treated as the accepted design, with the newly approved revision recorded and prior approval records preserved. Pending changes MUST be identified as unapproved until that approval is recorded. Superseded proposals MUST link to their accepted replacement, and the replacement MUST link back.

A UI design proposal does not replace an RFC when the [RFC standard](./rfcs.md#when-an-rfc-is-required) requires one. Required RFC acceptance remains a prerequisite for production work. Current implemented behaviour belongs in the relevant public or internal reference documentation, linked to the proposal where its reasoning is useful.

## Reusable model

The [UI design proposal model](../models/ui-design.md) provides separate templates for the main README, inspirations, mockups, and implementation rules, with guidance for splitting each part into linked files. Using a model is optional; all requirements remain defined by this standard.

## Revisions

| Revision | Date | Author | Description |
| --- | --- | --- | --- |
| 1        | 2026-10-16 | Akane SHIMOKA | Initial draft |
