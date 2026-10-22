---
id: core-ui-inspirations-bootstrap
---

# Core UI — Bootstrap

Part of the [inspirations](README.md) for the [Core UI design proposal](../README.md).

## Overview

Bootstrap provides a useful guide to common types of reusable interface components. Core UI's objective is not to reproduce the breadth of Bootstrap's catalogue, but to define a focused suite suited to White Eclipse's projects.

## Copyright and licence

Copyright © 2026 White Eclipse.

This document is released under the MIT License. See the project's root [LICENCE](../../../../../LICENCE) file for the complete licence text.

## Sources

[Bootstrap's official documentation](https://getbootstrap.com/docs/5.3/getting-started/introduction/), maintained by the Bootstrap team and contributors, organizes its toolkit into layout, content, forms, and components. This reference uses the Bootstrap 5.3 documentation. Bootstrap's code is MIT-licensed; its documentation is licensed under CC BY 3.0. This page provides an original interpretation and links to the source examples.

## Design direction

Use Bootstrap's catalogue as a guide when defining Core UI's [building blocks](../implementation-rules.md#building-blocks). The following families offer examples to consider according to project needs:

- **Actions and input:** buttons, button groups, text inputs, selects, checkboxes, radio buttons, and range controls.
- **Navigation:** breadcrumbs, navigation bars, tabs, dropdowns, and pagination.
- **Content and disclosure:** cards, list groups, tables, accordions, and collapsible regions.
- **Overlays:** modals, offcanvas panels, tooltips, and popovers.
- **Feedback:** alerts, badges, toasts, progress indicators, spinners, and loading placeholders.

The final catalogue will identify which elements Core UI provides, their responsibilities, and their variants and states. Associated [mockups](../mockups.md) will explore them using the [NieR: Automata-inspired visual direction](nier-automata.md).

## Boundaries

Bootstrap informs component coverage. Its default appearance, APIs, implementation, and dependencies are not selected by this reference. Technical stack choices remain reserved for an RFC.

The examples above are candidates, not an exhaustive or accepted Core UI catalogue. Core UI does not aim for component parity with Bootstrap; neither these families nor their individual components imply required coverage. Select components according to the intended projects' needs and identify additional needs before finalizing the component list.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-17 | Akane SHIMOKA | Initial draft |
