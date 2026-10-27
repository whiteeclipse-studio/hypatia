---
id: core-ui-inspirations-radix-primitives
---

# Core UI — Radix Themes

Radix Themes is the proposed styled foundation for Core UI. It supplies coordinated components and theme tokens; Core UI adds the White Eclipse visual identity and supported defaults.

Part of the [inspirations](README.md) for the [Core UI design proposal](../README.md).

## Sources

- [Radix Themes getting started](https://www.radix-ui.com/themes/docs/overview/getting-started), published by WorkOS: pre-styled components and a shared theme boundary.
- [Radix Themes styling](https://www.radix-ui.com/themes/docs/overview/styling): token-based customization, custom components, and portal inheritance.

These references are linked for review; no upstream code or assets are reproduced here.

## Design direction

Use the complete theme as the starting point for a coherent White Eclipse visual foundation. Preserve the shared palette, typography, flat surfaces, focus, and restrained motion across the foundational controls.

Applications use Radix Themes components directly, with Core UI supplying the shared theme and styling. The [implementation rules](../implementation-rules.md#radix-themes-boundary) define the boundary and when Core UI may add shared components.

## Boundaries

The [NieR: Automata direction](nier-automata.md) continues to guide appearance. Direct use of Radix Themes does not establish that every upstream component, variant, or prop has been styled or validated for Core UI.

Upstream styling and accessible building blocks do not prove Core UI's accessibility or tree-shaking results. Both require validation of the delivered Core UI package and its actual consumer builds.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-17 | Akane SHIMOKA | Initial draft |
| 2        | 2026-10-26 | Akane SHIMOKA | Align with direct use of Radix Themes components |
