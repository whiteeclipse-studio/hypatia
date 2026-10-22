---
id: storybook-prototype
standard_revision: 1
---

# Storybook prototype
## Summary

An exploratory workspace for the draft [Core UI design](../designs/core-ui/README.md), now covering the installed Radix Themes catalogue and additional Primitives. The draft [component inventory](../designs/core-ui/components.md) describes the 73 studies. This reference is subject to the [post-exploration rewrite](../designs/core-ui/README.md#post-exploration-rewrite).

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the MIT License. See the root [LICENCE](../../../LICENCE).

## Scope and applicability

Private application `@whiteeclipse/storybook`, version `2026.1.0-alpha.1`, using Bun, React, Vite, and the [Core UI package](../packages/core-ui/README.md). Tool versions are recorded in `.prototools` and `bun.lock`. This is exploratory work under draft [RFC-0001](../rfcs/0001-repository-structure.md); [RFC-0002](../rfcs/0002-tech-stack.md) also remains a draft. No design or RFC acceptance is recorded by the implementation.

## Reference

### Local use

From the repository root:

```sh
bun install --frozen-lockfile
bun run storybook
```

Open [the catalogue](http://127.0.0.1:6006/?path=/story/components-inputs-text-field--comparison). The sidebar and `src/components` folders share these areas: Buttons, Content, Disclosure, Feedback, Inputs, Layout, Navigation, Overlays, Typography, and Utilities.

Each study has a Playground with relevant controls and a Comparison with two visual or composition candidates. The toolbar switches light/dark appearance. Native Radix interactions remain available; the Accessibility panel supports manual review. Candidate styles stay local until a design is selected.

[Samples / Landing](http://127.0.0.1:6006/?path=/story/samples-landing--default) is a separate composed page in `src/samples/landing`, inspired by the supplied Cydonia landing concept. It uses existing components, generated transparent orbital/eclipse placeholder images, Font Awesome service/navigation/social icons, and the supplied company logo selected for the active light/dark appearance. A CSS woven background with faint orbital/diagonal lines is local to the sample, follows the theme colours, and stays fixed to the viewport during scrolling. Its central diagonal passes through the top-right circle centre, and the paired arcs are spaced 80px apart. Artwork and icon dependencies stay in the application; the Core UI package is unchanged. Disabled controls represent unavailable destinations and French translation. Header and hero links navigate within the sample. The [Core UI draft](../designs/core-ui/README.md) extracts shared visual/state rules and an area-based component inventory from this prototype. The landing remains an illustrative mockup, not the definitive landing design. Its [mockups, asset paths, generation prompts, and limitations](../designs/core-ui/mockups.md#landing-reference) describe the exploratory scope. The catalogue now has 146 component stories and two page samples; the strict coverage check accounts for both categories separately.

[Samples / Documentation](http://127.0.0.1:6006/?path=/story/samples-documentation--default) adds a reading shell in `src/samples/documentation`: theme-aware branding, repository context, native directory disclosures, local section navigation, and responsive layout rules. Both page samples share the fixed woven/geometric background in `src/samples/woven-background.css`. Shared typography loads Outfit, Inter, and JetBrains Mono from Google Fonts through the Core UI stylesheet. It displays selected source excerpts without importing or rendering Markdown. The [mockup notes and repository SVG wireframes](../designs/core-ui/mockups.md#documentation-website-reference) distinguish intended composition from unverified browser behaviour.

### Checks

```sh
bun run typecheck
bun run build
bun run check:catalogue
```

The build emits the Core UI ES module bundle and the static application in `apps/storybook/storybook-static`. The coverage check verifies source and sidebar coverage against installed Radix exports and the built index. Generated build outputs remain ignored by Git. These commands do not publish or deploy anything.

## Constraints and failure modes

No final design, production contract, deployment, or acceptance is implied. Examples use synthetic content and local state; they do not persist settings or perform real authentication, submissions, destructive actions, or real submissions. The Theme Panel utility retains its explicit upstream Copy action, which can copy theme configuration to the local clipboard. There is no automated capture command. Landing and component [mockups](../designs/core-ui/mockups.md) were captured directly from Storybook; the documentation shell uses explicitly labelled SVG wireframes.

If port 6006 is occupied, stop the conflicting server or pass another port to the application script. Restart Storybook after large story-tree changes if its development index becomes stale. Build before running the coverage check. Preview/unstable APIs and known review gaps are identified in the [component inventory](../designs/core-ui/components.md#coverage-boundaries-and-review-gaps).

## Verification and sources

Type checks, both builds, and the coverage check passed on 2026-10-18. Browser smoke checks rendered all 146 component stories. The additional landing sample was reviewed in desktop light/dark appearance and a 320px Storybook viewport, with local studio navigation checked. These are historical exploratory observations; they do not establish complete interaction or accessibility verification. Unit/integration and automated accessibility suites were not run for this exploratory pass.

On 2026-10-20, type checks, both builds, and catalogue coverage passed after adding the documentation sample (148 stories). Browser access was declined by the local-origin approval gate, so its rendering, responsiveness, keyboard interactions, and accessibility remain unverified. Unit/integration tests were omitted for this exploratory addition.

Sources: [story configuration](../../../apps/storybook/.storybook/main.ts), [component folders](../../../apps/storybook/src/components), [coverage manifest](../../../apps/storybook/src/components/catalogue.json), and [catalogue check](../../../apps/storybook/scripts/check-catalogue.mjs).

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-18 | Akane SHIMOKA | Initial draft |
