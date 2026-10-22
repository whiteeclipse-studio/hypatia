---
id: core-ui
standard_revision: 1
status: draft
---

# Core UI

## Summary

Core UI proposes White Eclipse's shared interface language: warm off-white and charcoal surfaces, readable typography, flat controls, precise corner frames, restrained geometric backgrounds, and predictable interactions. It supports the company's websites and reading experiences through reusable components, rather than prescribing a single application layout.

This draft extracts the design explored in the component catalogue and landing sample. It records concrete values and behaviours for review, retains alternative component treatments, and distinguishes existing prototype observations from proposed requirements. The landing page is a **Core UI mockup, not the definitive design of White Eclipse's landing page**.

## Copyright and licence

Copyright © 2026 White Eclipse.

This document is released under the MIT License. See the project's root [LICENCE](../../../../LICENCE) file for the complete licence text.

## Requirement terminology

Uppercase requirement keywords follow IETF **BCP 14**, as defined by [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and clarified by [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174). **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **NOT RECOMMENDED**, **MAY**, and **OPTIONAL** carry those meanings only when written entirely in uppercase. Requirements in this draft express the proposed design; they do not record owner acceptance.

## Context and scope

The foundation serves visitors, readers, and people operating White Eclipse interfaces, as well as the designers and developers composing those interfaces. Initial consumers include the company website, Hypatia's documentation experience, and Cydonia's portfolio. Long-form content and compact controls share the same visual identity while retaining appropriate density and semantics.

The proposal covers:

- Light/dark colour roles, typography, spacing, borders, iconography, brand placement, motion, and an optional decorative background treatment.
- A component catalogue grouped into Buttons, Content, Disclosure, Feedback, Inputs, Layout, Navigation, Overlays, Typography, and Utilities.
- Component states, keyboard and pointer behaviour, theme inheritance, readable adaptations, and review criteria.
- Component-rendered samples demonstrating the foundation in context.

The mockup's copy, section order, service offerings, navigation destinations, language availability, editorial sizing, and portfolio artwork are illustrative. They do not establish a final landing-page information architecture, business commitment, translation policy, or interactive solar-system experience. Generated images remain temporary application artwork. Company logo files are supplied assets; redesigning their fragmentation mark is outside this proposal.

React, Vite, Bun, Radix Themes/Primitives, and the current workspace arrangement are exploratory implementation choices. [RFC-0001](../../rfcs/0001-repository-structure.md) is still a draft; [RFC-0002](../../rfcs/0002-tech-stack.md) is also a draft proposing technical choices and the public documentation pipeline. These samples do not accept either RFC.

### Post-exploration rewrite

After the exploratory phase, the entire Core UI documentation set MUST be rewritten from scratch, including this proposal and its supporting pages, package documentation, and Storybook prototype reference. Existing descriptions and verification reports remain exploratory material until that rewrite. Obsolete exploratory captures and assets MUST be dropped during the rewrite.

Once the rewrite is under way, consolidate exact behaviour and visual values in the implementation rules. Mockups should describe depicted states and approximations and link to those rules; package documentation should describe current usage without maintaining a duplicate design specification.

## Documentation index

- [Inspirations](inspirations/README.md): the visual direction, behavioural references, and boundaries of their use.
- [Mockups](mockups.md): the illustrative landing and documentation compositions, light/dark samples, scrolled captures, component specimens, and limitations.
- [Implementation rules](implementation-rules.md): proposed visual values, state rules, accessibility requirements, and verification criteria.
- [Component catalogue](components.md): all 73 studies, their responsibilities, candidate treatments, and state contracts, organized by area.
- [Prototype reference](../../reference/storybook-prototype.md): local workflow and exploratory checks.

The implementation rules define proposed shared behaviour. Mockup-specific measurements are explicitly separated there; a screenshot does not override a rule or turn an illustrative value into a universal token.

## User journeys

**Review a component.** A reviewer enters `Components / <Area> / <Component>`, compares candidates with matching content, then opens Playground to change supported controls. They exercise focus, hover, activation, selection, disabled/loading conditions, and light/dark appearance. The outcome is a reviewable choice or a recorded discrepancy, not automatic acceptance.

**Compose an interface.** A designer combines layout, typography, navigation, actions, fields, and feedback from the catalogue. They review the landing mockup for hierarchy and brand expression, then adapt composition to their own content. Unavailable destinations stay clearly identified in exploratory samples; real workflows require their own design and error/recovery paths.

**Operate an interface.** A visitor follows a semantic link, activates a button, changes a labelled value, or opens a disclosure/overlay. Current state is visible and exposed to assistive technology. Cancellation, dismissal, and validation errors preserve an understandable route back to the task. Application authorization and data handling remain outside this visual foundation.

A Storybook-based presentation demo MUST present every component defined by this design and its specified variants, states, and interactions. The 73-study catalogue supplies a starting review scope; it does not mean every state has been implemented or checked.

**Read documentation.** The [documentation mockup](mockups.md#documentation-website-reference) explores repository context, source-directory navigation, breadcrumbs, and local article contents. It uses selected public-source excerpts and collapsible directories, with a narrow-screen navigation disclosure. Remote document loading and publication remain outside this exploratory sample.

## Consequences and alternatives

Shared tokens and state cues reduce visual drift across projects. Flat surfaces and fine rules keep the interface quiet; visible focus and semantic labels carry interaction meaning. Corner outlines add identity without changing control size. Font Awesome supplies recognizable icons, while the company's supplied logo remains a distinct brand asset.

The textured background adds character but can compete with dense content and low-contrast graphics. It is an optional composition treatment, with flat surfaces available for reading and data entry. Outfit, Inter, and JetBrains Mono establish distinct brand, reading, and code roles. Google Fonts loading adds external requests and may change text wrapping when the fonts replace fallback faces. Keeping several component candidates increases review work until variants are selected. Full upstream catalogue coverage also includes utilities and unstable previews that may never become production design-system contracts.

Alternatives include an unmodified component-library theme, a token-only visual guide, or separately designed websites. The first offers less brand expression; the second leaves interaction consistency to each project; the third duplicates design and verification work. A plain background remains a deliberate alternative where the decorative treatment harms readability.

## Validation

The deployed Storybook catalogue MUST serve as the validation layer for complete implementation. Review MUST compare the deployed build with this complete proposal, including [component contracts](components.md), [visual and accessibility rules](implementation-rules.md), and repository mockups. It MUST cover every specified component, variant, state, interaction, theme, and adaptation, with discrepancies resolved before acceptance.

Review criteria are observable: corner frames complete without layout shift; keyboard focus stays visible; controls preserve state cues without relying only on colour; nested and portalled surfaces retain the active theme; background geometry remains fixed and aligned while scrolling; long text and narrow layouts remain usable; feedback and errors have understandable recovery. The landing mockup demonstrates composition, not a required page layout.

Completed exploratory checks on 2026-10-18 include type checks, both builds, installed-export coverage, rendering of the 146 component stories, selected interaction checks, and landing light/dark, narrow-viewport, logo, background-alignment, and scrolling observations. These are recorded in the [prototype reference](../../reference/storybook-prototype.md) and [mockups](mockups.md). Unit/integration and automated accessibility suites were omitted during prototyping. Complete contrast, assistive-technology, cross-browser, long-content, and touch validation remain pending. No deployed review URL or owner approval is recorded.

Only after the complete catalogue has been deployed and reviewed may the responsible human owner mark the design accepted. Acceptance MUST record the owner, date, approval reference, reviewed catalogue URL/build, fixed source snapshot, approved README revision, and covered supporting document IDs/revisions/assets. Passing checks, implementing a prototype, or requesting this extraction does not establish acceptance.

## Open questions

| Question | Boundary and resolution condition |
| --- | --- |
| Which candidates become supported variants? | Retain all documented comparisons for review; select or deliberately retain alternatives per component before acceptance. Do not infer a winning treatment from its default story args. |
| What is the final accessibility and browser support commitment? | WCAG 2.2 AA is proposed as the web review target in the rules. Confirm scope, supported browser/assistive-technology combinations, touch target policy, and validation evidence before acceptance. No conformance is claimed. |
| Which feedback colours and state treatments are final? | Neutral roles are extracted; destructive/error examples still inherit Radix red, while success/warning/information palettes and all contrast pairings need review. Resolve these before accepting the affected component contracts. |
| Which upstream components and APIs become a stable Core UI contract? | The 73 studies are the draft review inventory. Resolve production inclusion, preview/unstable fields, final size/variant mappings, and packaging through the relevant design review and future RFC-0002. |
| Which typography details need adjustment? | The font roles are specified in the implementation rules. Review web-font and fallback rendering, dense text, zoom, and translations before acceptance; the selection alone does not establish visual or accessibility validation. |
| Where may the decorative background be used? | The landing demonstrates fixed geometry and a fine grid. Check dense reading, data-entry surfaces, forced colours, narrow/tall viewports, and contrast before making it a default beyond this optional treatment. |
| What happens to the sample landing and generated artwork? | They stay illustrative under this proposal. A definitive landing design, real destinations, translations, and final imagery require separate product design; accepting Core UI does not implicitly accept them. |

Material design questions above MUST be resolved before acceptance. Deferred application-specific content remains outside this proposal with the boundaries stated here. Technical decisions and production readiness remain subject to the relevant RFCs.

## Decision record

Draft; owner acceptance is pending. No approved revision, approval reference, deployed validation build, or accepted technical RFC is recorded. The current supporting set comprises `core-ui-inspirations` and its linked source pages, `core-ui-mockups`, `core-ui-implementation-rules`, and `core-ui-components`, plus their referenced assets. This identifies review scope only.

## Revisions

| Revision | Date | Author | Description |
| --- | --- | --- | --- |
| 1 | 2026-10-17 | Akane SHIMOKA | Initial draft |
