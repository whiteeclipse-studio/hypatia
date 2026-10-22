---
id: core-ui-inspirations-radix-primitives
---

# Core UI — Radix Primitives

Part of the [inspirations](README.md) for the [Core UI design proposal](../README.md).

## Overview

Radix Primitives provides a reference for how reusable components behave. Bootstrap helps identify useful component types; Radix adds examples of their interaction details, independently of their appearance.

## Copyright and licence

Copyright © 2026 White Eclipse.

This document is released under the MIT License. See the project's root [LICENCE](../../../../../LICENCE) file for the complete licence text.

## Sources

[Radix Primitives' official documentation](https://www.radix-ui.com/primitives/docs/overview/introduction), published by WorkOS, describes unstyled components with attention to accessibility, focus management, and keyboard navigation. Its linked examples provide material for studying component behaviour. This page links to those references without reproducing their code or assets.

## Design direction

Use Radix's examples to examine how components respond to input and move between states. When specifying a dialog, menu, or similar control, consider how it opens and closes, where focus moves, and how keyboard users navigate and leave it.

Record the resulting Core UI behaviour in the [interaction and accessibility rules](../implementation-rules.md#interaction-and-accessibility). The [NieR: Automata direction](nier-automata.md) continues to guide appearance.

## Boundaries

Radix supplements the [Bootstrap reference](bootstrap.md) with behavioural examples. It does not expand the required component catalogue or select a dependency, framework, or API. Those technical choices remain reserved for an RFC.

Accessibility guidance comes from the W3C references identified in the implementation rules. Examples from a component library do not by themselves establish Core UI's accessibility compliance.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-17 | Akane SHIMOKA | Initial draft |
