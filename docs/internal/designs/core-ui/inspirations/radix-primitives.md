---
id: core-ui-inspirations-radix-primitives
---

# Core UI — Radix Themes

Part of the [inspirations](README.md) for the [Core UI design proposal](../README.md). The document ID and filename are retained from the earlier Primitives reference.

## Overview

Radix Themes is the proposed styled foundation for Core UI. It supplies coordinated components and theme tokens; Core UI adds the White Eclipse visual identity, supported defaults, and shared compositions. Primitives remain useful building blocks when Themes does not cover a control.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the MIT License. See the root [LICENCE](https://github.com/whiteeclipse-studio/hypatia/blob/main/LICENCE).

## Sources

- [Radix Themes getting started](https://www.radix-ui.com/themes/docs/overview/getting-started), published by WorkOS: pre-styled components and a shared theme boundary.
- [Radix Themes styling](https://www.radix-ui.com/themes/docs/overview/styling): token-based customization, custom components, and portal inheritance.
- [Segmented Control](https://www.radix-ui.com/themes/docs/components/segmented-control): the styled single-value control used as the language-switch reference.
- [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction): lower-level interaction and accessibility building blocks.

These references are linked for review; no upstream code or assets are reproduced here.

## Design direction

Use the complete theme as the starting point for a coherent White Eclipse component library. Preserve the shared palette, typography, flat surfaces, focus, and restrained motion across ordinary controls and owned compositions such as the language switch.

Core UI's components provide the supported interface. Applications should not repeat the styling or internal composition of those controls. The [implementation rules](../implementation-rules.md) define the resulting behaviour and modular-delivery goals.

## Boundaries

The [NieR: Automata direction](nier-automata.md) continues to guide appearance. Core UI does not automatically inherit every upstream component, variant, or prop. Dependency selection and packaging are proposed in draft [RFC-0002](0002-tech-stack.md#core-ui-theme-and-component-library); this inspiration page does not accept that proposal.

Upstream styling and accessible building blocks do not prove Core UI's accessibility or tree-shaking results. Both require validation of the delivered Core UI package and its actual consumer builds.

## Revisions

| Revision | Date       | Author        | Description                                                                                   |
| -------- | ---------- | ------------- | --------------------------------------------------------------------------------------------- |
| 1        | 2026-10-17 | Akane SHIMOKA | Initial draft                                                                                 |
| 2        | 2026-10-25 | Akane SHIMOKA | Propose Radix Themes as the styled foundation, with Primitives as internal supporting blocks. |
