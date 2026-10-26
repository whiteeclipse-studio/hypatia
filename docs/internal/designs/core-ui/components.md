---
id: core-ui-components
---

# Core UI — Component catalogue

Part of the [design proposal](README.md) and its [implementation rules](implementation-rules.md#building-blocks).

## Overview

This catalogue proposes a Core UI-owned styled library, using the previous components as the visual baseline. The library combines Radix Themes-based controls with shared compositions such as the language switch. The tables below retain the 73 historical studies for comparison; they are not a declaration that every upstream export will be supported.

A row's state contract combines intended semantic responsibility with explicitly described sample behaviour. It does not claim that every keyboard, accessibility, error, long-content, or async case has been verified. The common [state contract](implementation-rules.md#common-state-contract) and [interaction rules](implementation-rules.md#interaction-and-accessibility) apply to all relevant rows. Noninteractive typography/layout elements have no artificial loading or disabled states.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the MIT License. See the root [LICENCE](https://github.com/whiteeclipse-studio/hypatia/blob/main/LICENCE). Upstream component and icon licences still apply.

## Requirement terminology

Uppercase requirement keywords follow IETF BCP 14, as defined by [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174). They carry those meanings only when written entirely in uppercase and describe the proposed design.

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-18 | Akane SHIMOKA | Initial draft |
