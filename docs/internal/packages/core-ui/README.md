---
id: package-core-ui
standard_revision: 1
---

# Core UI package

## Overview

`@whiteeclipse/core-ui` is a private workspace package at `packages/platform/core-ui`. It provides the exploratory White Eclipse theme and Radix exports used by the [Storybook prototype](../../reference/storybook-prototype.md). This documentation is subject to the [post-exploration rewrite](../../designs/core-ui/README.md#post-exploration-rewrite).

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the MIT License. See the root [LICENCE](../../../../LICENCE).

## Applicability

Covers unpublished `0.1.0-alpha.1` only. Requires React/React DOM 19 and a consumer that processes TypeScript source and CSS, currently Vite. Dependencies are Radix Themes 3.3.0, `radix-ui` 1.8.1, and Radix Toggle 1.2.1. The umbrella Primitive package was already transitive through Themes; it is now declared directly because the exploratory exports use it.

This work is associated with draft [RFC-0001](../../rfcs/0001-repository-structure.md) and draft [RFC-0002](../../rfcs/0002-tech-stack.md). Interfaces, styling, and package boundaries are provisional. No package has been published, and no migration applies.

## Installation and quick start

Run `bun install --frozen-lockfile` at the repository root. Workspace consumers declare `"@whiteeclipse/core-ui": "workspace:*"` and supply React/React DOM.

```tsx
import { Button, CoreTheme } from '@whiteeclipse/core-ui';
import '@whiteeclipse/core-ui/styles.css';

export function Example() {
    return <CoreTheme><Button variant="solid">Continue</Button></CoreTheme>;
}
```

### Interface and configuration

The `.` entrypoint exposes:

- `CoreTheme` and `CoreThemeProps`: Radix Theme props with default light appearance, gray accent, sand neutrals, no radius, and solid panels. Supplied props override defaults and class names are combined with `core-ui`.
- All public values and types from `@radix-ui/themes`, with their upstream APIs. The [coverage manifest](../../../../apps/storybook/src/components/catalogue.json) maps the runtime exports to studies, including typography, layout, overlays, inputs, and utility components.
- `Primitives`: the `radix-ui` namespace, for unstyled interaction families such as Accordion, Collapsible, Menubar, NavigationMenu, Toast, Toolbar, and the preview form/password fields. These require composition and styling. Unstable members retain their upstream names.
- `Toggle`: the existing direct Radix Toggle `Root` alias, retained for the earlier button study. It accepts `pressed`/`defaultPressed`, `onPressedChange`, and `disabled` with upstream button semantics.

Import `./styles.css` once before local overrides. It loads Radix CSS, then the provisional palette, typography, flat surfaces, keyboard focus, and reduced-motion defaults. Radix-created nested/portal theme boundaries receive the same defaults. Omitting the stylesheet leaves the components unstyled. Catalogue-specific candidates live in the application rather than becoming package API or accepted design requirements.

Use visible labels or appropriate accessible names. Supply required relationships and values to compound components, including named radio groups, labelled fields, dialog titles/descriptions, and selection values. The package does not add persistence, application API calls, or package-specific errors. Importing its stylesheet requests Google Fonts: Outfit for brand/display roles, Inter for body text, and JetBrains Mono for monospace. The request uses `display=swap`, weights 300–700, and Inter/JetBrains Mono italics; fallback stacks remain readable if font requests fail. Brand consumers use `--brand-font-family`; semantic h1/h2 elements use the display role, while smaller headings retain the body role. See the [upstream Themes](https://www.radix-ui.com/themes/docs/overview/getting-started) and [Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction) references for individual prop/event contracts; the installed versions govern this prototype.

Native `details`/`summary` disclosures use decorative plus/minus markers with fine corner brackets. Primitive Accordion and Collapsible triggers opt in with `className="core-ui-disclosure-trigger"`; Radix's `data-state` selects plus when closed and minus when open. The 16px indicator inherits `currentColor` and changes plus/minus immediately without rotation. CSS background layers draw 1px strokes with 3px corner segments inset 1px. On hover or visible keyboard focus, opposing segments extend to 50%, completing a square over 180ms ease-out; they retract on exit. Disabled triggers retain the resting frame, and shared reduced-motion rules suppress visible animation. See the [shared stylesheet](../../../../packages/platform/core-ui/src/styles.css). Visible labels and native/Radix expansion semantics remain responsible for accessibility.

### Build and distribution boundary

The build emits an ES module bundle with React and Radix externalized. Workspace exports still point at source. Publishing, declaration output, distributed CSS/licence packaging, compatibility commitments, and complete consumer documentation need review before a registry release.

## Documentation index

- [Interface and configuration](#interface-and-configuration): current entrypoints and styling.
- [Storybook workflow](../../reference/storybook-prototype.md): local commands.
- [Draft component inventory](../../designs/core-ui/components.md): exploratory studies, preview APIs, and known review gaps.

## Support and related resources

See the draft [Core UI proposal](../../designs/core-ui/README.md) and root [CODEOWNERS](../../../../CODEOWNERS). No published releases or migration guides exist. Human design/RFC decisions remain pending.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-18 | Akane SHIMOKA | Initial draft |
