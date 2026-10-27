---
id: core-ui-implementation-rules
---

# Core UI — Implementation rules

Visual and interaction rules for the [Core UI proposal](./README.md).

## Foundations

### Radix Themes boundary

- Applications MUST use Radix Themes components directly.
- Core UI MUST provide shared styling, tokens, fonts, and assets.
- Core UI MUST NOT wrap or re-export components solely for styling or defaults.
- Shared components MAY add behaviour or composition beyond Radix, within the [proposal scope](./README.md#scope).

Unspecified scales, sizes, variants, geometry, shadows, and interactions MUST retain Radix Themes defaults.

### Visual foundations

- Styling MUST use shared tokens with consistent roles across themes and the [colours](#colours) below. Additional colours MUST convey meaning.
- Controls SHOULD be flat, rectangular, and restrained.
- Typography MUST support long-form reading; compact labels and monospace annotations SHOULD remain secondary.
- Motion SHOULD be subtle, responsive, and consistent.

### Colours

Both themes MUST use these colour roles:

| Role                                        | Light     | Dark      |
| ------------------------------------------- | --------- | --------- |
| Base background                             | `#f6f2e6` | `#211f26` |
| Panel background                            | `#eeeadb` | `#29272e` |
| Soft hover, read-only, and disabled surface | `#e6e0cf` | `#333138` |
| Primary text                                | `#211f26` | `#f6f2e6` |
| Secondary text and focus colour             | `#625c52` | `#b9b19f` |
| Control borders                             | `#796d57` | `#9c929d` |
| Disabled text and borders                   | `#948970` | `#837b85` |
| Success fill                                | `#879b69` | `#879b69` |
| Warning fill                                | `#e1d8aa` | `#e1d8aa` |
| Error fill                                  | `#ac4b35` | `#ac4b35` |
| Error accent and field border               | `#cd664d` | `#cd664d` |
| Text on success and warning fills           | `#161518` | `#161518` |
| Text on error fill                          | `#f6f2e6` | `#f6f2e6` |
| Inline success text                         | `#3d5029` | `#c3d6ab` |
| Inline warning text                         | `#685819` | `#efe3ae` |
| Inline error text                           | `#9c422d` | `#ee9b83` |

### Typography

Both themes MUST use these fonts:

| Role                           | Font           |
| ------------------------------ | -------------- |
| Company name and headings      | Outfit         |
| Body text and interface labels | Inter          |
| Code and monospace annotations | JetBrains Mono |

The shared stylesheet MUST load these fonts and expose tokens with sans-serif or monospace fallbacks.

## Visual elements

### Corner frames

Buttons, select triggers, checkboxes, radios, and switches MUST use square corner frames:

| Property                                                | Value                            |
| ------------------------------------------------------- | -------------------------------- |
| Stroke thickness                                        | 1px                              |
| Resting stroke length: buttons and select triggers      | 8px                              |
| Resting stroke length: checkboxes, radios, and switches | 4px                              |
| Hover and keyboard focus                                | Strokes meet at 50% of each edge |
| Expansion and retraction                                | 180ms, `ease-out`                |
| Frame colour                                            | Control-border colour            |

Frames MUST NOT affect layout. Disabled frames MUST stay muted without hover expansion. Reduced-motion preferences MUST remove frame and fill transitions.

### Buttons

Buttons MUST be transparent with primary text and corner frames. Markers MUST precede labels in the text colour.

| Variant                                | Marker                          |
| -------------------------------------- | ------------------------------- |
| Primary (`solid`)                      | Filled 6px square               |
| Secondary (`soft`) and ghost          | Hollow 6px square, 1px stroke   |
| Outline                                | No marker                       |
| Disabled                               | No marker; muted text and frame |

Loading buttons MUST use Radix Themes' default loading behaviour: replace visible content with a centred spinner, preserve dimensions and the accessible label, and disable activation while loading.

### Tabs

Tabs MUST use rectangular labels without corner frames.

| State      | Appearance                                                                              |
| ---------- | --------------------------------------------------------------------------------------- |
| Unselected | Secondary text; no square or reserved marker space                                      |
| Hover      | Primary text on the soft neutral surface (`--gray-3`)                                   |
| Selected   | Primary-foreground fill, base-background text, and a filled 6px square before the label |
| Disabled   | Muted text on a transparent surface                                                     |

### Text fields

Text fields MUST retain a continuous 1px rectangular border at rest.

| Element or state | Appearance                                          |
| ---------------- | --------------------------------------------------- |
| Editable field   | Base background; primary-foreground border and text |
| Placeholder      | Secondary text                                      |
| Read-only field  | Muted surface (`--gray-3`)                          |
| Disabled field   | Muted surface, border, and text                     |
| Invalid field    | Error-accent border and a textual error message     |

### Selection controls

State indicators MUST remain visible independently of hover and framing.

| Control and state                             | Appearance                                                                   |
| --------------------------------------------- | ---------------------------------------------------------------------------- |
| Checkbox: unchecked / checked / indeterminate | No indicator / check mark / dash                                             |
| Radio: unselected / selected                  | No indicator / dot                                                           |
| Switch: off                                   | Panel-background track; hollow thumb with a 1px secondary-text-colour border |
| Switch: on                                    | Panel-background track; primary-foreground thumb fill and border             |
| Disabled                                      | Muted treatment; current state remains identifiable                          |

Enabled switches MUST keep the same panel-background track and shared control-border corner colour in both states. The off thumb MUST be transparent inside its border; the on thumb MUST be filled. Switch thumbs MUST be square, inset 4px, and positioned by state. Thumb fill and border colours MUST transition over 140ms with `ease-in-out`, alongside the 140ms slide using `cubic-bezier(0.45, 0.05, 0.55, 0.95)`. Reduced-motion preferences MUST remove track and thumb transitions.

### Feedback

Callouts and badges MUST use the status fill and text colours, with 1px inset outlines: text-coloured for success/warning, error-accent for errors. Inline messages MUST use inline status colours. All feedback MUST include text.

### Keyboard focus

Controls MUST have a separate 2px focus outline, offset 3px, using the focus colour. Text fields MUST use primary foreground and retain the outline while focus is within.

### Background

The shared stylesheet MUST provide the optional `core-ui-background` class:

| Element           | Values                                                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Surface           | Base background; minimum height `100vh`                                                                                 |
| Grid              | 8px spacing, 1px lines; primary foreground at 3% opacity                                                                |
| Geometric strokes | Primary foreground at 7% opacity; both inks mixed with transparent in sRGB                                              |
| Arcs              | Top-right viewport centre; inner radius `clamp(280px, 35vw, 560px)`; 80px separation; 1px strokes with a 1px outer fade |
| Diagonals         | Three 2px bands at 135 degrees, approximately 80px apart                                                                |
| Drawing area      | Square with side `max(100vw, 100vh)`, anchored at the viewport's top-right corner                                       |

Decoration MUST stay fixed behind scrolling content and ignore pointer input. Applications SHOULD use one wrapper per page, with opaque reading surfaces where needed.

## Validation

Review MUST cover:

- All control states in both themes, without layout shifts or obscured indicators.
- Keyboard and touch operation, focus visibility, loading announcements, and reduced motion.
- Text, border, and focus contrast on actual surfaces, including feedback and decoration.
- Narrow/wide viewports and scrolling, without horizontal overflow or inoperable controls.

Results MUST be recorded in [review coverage](./design.md#review-coverage).

## Accessibility

Design and implementation MUST satisfy applicable [WCAG 2.2](https://www.w3.org/TR/WCAG22/) Level A and AA criteria, including customizations, and SHOULD satisfy Level AAA.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-27 | Akane SHIMOKA | Initial draft |
