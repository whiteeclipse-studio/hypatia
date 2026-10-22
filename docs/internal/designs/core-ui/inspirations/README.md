---
id: core-ui-inspirations
---

# Core UI — Inspirations

Part of the [design proposal](../README.md).

## Overview

This part documents the inspirations for White Eclipse's shared visual identity and reusable interface components. NieR: Automata is the primary visual reference for Core UI and applications built by White Eclipse. Bootstrap provides a reference for component coverage. The linked source pages explain their intended contribution and boundaries; the prototype and supplied brand material below show how these references have been interpreted.

## Copyright and licence

Copyright © 2026 White Eclipse.

This document is released under the MIT License. See the project's root [LICENCE](../../../../../LICENCE) file for the complete licence text.

## Sources

- [NieR: Automata](nier-automata.md): primary visual inspiration and its connection to the White Eclipse identity.
- [Bootstrap](bootstrap.md): guide to useful component types, with Core UI's scope determined by project needs.
- [Radix Primitives](radix-primitives.md): reference for component behaviour, focus management, and keyboard interactions.

### Prototype and supplied material

- The company logo files were supplied by the user for light/dark surfaces. They are brand assets, not generated approximations. Their [mockup usage](../mockups.md#landing-reference) preserves the fragmented eclipse symbol and separates it from Font Awesome interface icons.
- The user-supplied Cydonia desktop landing concept informed the exploratory header, hero, studio, services, final sections, and footer. The [landing mockup](../mockups.md#landing-reference) uses that arrangement solely to demonstrate Core UI; it does not establish a definitive landing design.
- The supplied background reference informed a fine weave, quiet arcs, and parallel diagonal strokes. Its decorated side rails were deliberately excluded. White Eclipse's off-white/charcoal palette replaces the reference's beige; the latest study fixes geometry to the viewport and aligns its central diagonal with the circle centre.
- Font Awesome, published by Fonticons, supplies the proposed interface icon vocabulary shown in the prototype. The [integration reference](https://docs.fontawesome.com/web/use-with/react/add-icons/) is technical context; exact package adoption remains an RFC concern. Existing utility indicators are retained as comparison material rather than described as a completed migration.
- Generated orbital/eclipse images are temporary illustrative material. Their [paths and prompts](../mockups.md#generated-placeholder-assets) record provenance. They demonstrate composition alongside real components and do not replace the page with a generated mockup image.

## Design direction

NieR: Automata provides the primary visual direction: a coherent, purposeful interface with warm neutral colours, flat surfaces, precise graphic details, readable typography, and smooth, restrained transitions. Core UI translates these qualities into a shared White Eclipse vocabulary that can support both concise interfaces and longer reading experiences.

Bootstrap and Radix Primitives complement this direction. Bootstrap offers a guide to useful component types, while Radix provides examples of interaction behaviour, focus management, and keyboard navigation. Together, they inform a focused component suite shaped by White Eclipse's project needs. 

The extracted design uses flat rectangular controls, four-corner frames that complete on hover/focus, persistent selection symbols, system sans-serif reading text, monospace short annotations, and optional fixed geometric texture. The supplied logo remains an independent brand symbol. Exact values and behaviour are maintained in [implementation rules](../implementation-rules.md), with alternatives retained in the [component catalogue](../components.md).

## Boundaries

These references guide the proposal without selecting a technical stack, requiring parity with another library, or reproducing game assets and effects. Core UI's [draft component contracts](../components.md), accessibility requirements, and visual rules determine the proposed interpretation. No source screenshot or prototype default by itself records an accepted choice. The landing's content/layout and generated images remain illustrative; the final landing page needs its own application design.

## Revisions

| Revision | Date | Author | Description |
| --- | --- | --- | --- |
| 1 | 2026-10-17 | Akane SHIMOKA | Initial draft |
