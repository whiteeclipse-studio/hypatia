---
id: core-ui-components
---

# Core UI — Component catalogue

Part of the [design proposal](README.md) and its [implementation rules](implementation-rules.md#building-blocks).

## Overview

This is the complete draft review inventory extracted from the 73 current component studies, grouped by the same areas as source folders and Storybook. It records responsibilities and visible candidates without selecting every default as the final design. Each study has Playground and Comparison; source links below expose the sample composition. This inventory is subject to the [post-exploration rewrite](README.md#post-exploration-rewrite).

A row's state contract combines intended semantic responsibility with explicitly described sample behaviour. It does not claim that every keyboard, accessibility, error, long-content, or async case has been verified. The common [state contract](implementation-rules.md#common-state-contract) and [interaction rules](implementation-rules.md#interaction-and-accessibility) apply to all relevant rows. Noninteractive typography/layout elements have no artificial loading or disabled states.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the MIT License. See the project's root [LICENCE](../../../../LICENCE). This authored description does not replace upstream component or icon licences.

## Reading the catalogue

Inputs are names, content, values, state, size/density, placement, and availability as relevant to each component. Outputs are action activation, value/selection changes, expansion/dismissal, local demonstration status, or a composed layout. Exact production property/callback interfaces are outside this design extraction. Follow the prototype's explicit Playground controls for the current sample API; do not assume a control is implemented solely because it appears in the panel.

The local hierarchy is `Components / <Area> / <Component>`. The separate `Samples / Landing` entry composes components into an illustrative page, not a 74th primitive. Candidate names below preserve the current study labels; “surface”, “classic”, “soft”, and “outline” are comparison vocabulary rather than separately accepted design tokens. Placements, orientations, densities, and loading/ready views also count as meaningful comparisons.

## Buttons

| Component / source | Candidate views | Responsibility and states |
| --- | --- | --- |
| [Destructive action](../../../../apps/storybook/src/components/buttons/destructive-button.stories.tsx) | Solid / Outline | Signal a destructive action; disabled suppresses it. Sample does not remove data. |
| [Icon](../../../../apps/storybook/src/components/buttons/icon-button.stories.tsx) | Corners / Filled | Named icon-only action; default/disabled/loading, corners or filled surface; icon is decorative to its name. |
| [Primary](../../../../apps/storybook/src/components/buttons/primary-button.stories.tsx) | Plain / With marker | Main action; plain or 6px marker, corner frame, default/disabled/loading; label and size are editable. |
| [Secondary action](../../../../apps/storybook/src/components/buttons/secondary-button.stories.tsx) | Soft / Outline | Supporting action; enabled/disabled; softer prominence than primary. |
| [Toggle group](../../../../apps/storybook/src/components/buttons/toggle-group.stories.tsx) | Surface / Outline | Multiple pressed values in the formatting example; one option unavailable. Group-wide disabled control is exposed but currently not wired: review gap. |
| [Toggle](../../../../apps/storybook/src/components/buttons/toggle.stories.tsx) | Fill / Marker | Persistent pressed boolean with stable label; fill or square-marker selection; enabled and disabled on/off. |

## Content

| Component / source | Candidate views | Responsibility and states |
| --- | --- | --- |
| [Avatar](../../../../apps/storybook/src/components/content/avatar.stories.tsx) | Soft fallback / Solid fallback | Identity representation with initials fallback and accessible identity; two fallback sizes, no real portrait request. |
| [Badge](../../../../apps/storybook/src/components/content/badge.stories.tsx) | Soft / Outline | Short noninteractive category/status label; status meaning still needs text rather than colour alone. |
| [Card](../../../../apps/storybook/src/components/content/card.stories.tsx) | Surface / Classic | Group related heading and content; surface boundary, no implied click or selection. |
| [Data list](../../../../apps/storybook/src/components/content/data-list.stories.tsx) | Horizontal / Vertical | Label/value pairs; orientation changes presentation without losing the association. |
| [Scroll area](../../../../apps/storybook/src/components/content/scroll-area.stories.tsx) | Persistent scrollbar / Scrollbar on hover | Bounded overflowing content; persistent or hover scrollbar; retain keyboard access to content. |
| [Table](../../../../apps/storybook/src/components/content/table.stories.tsx) | Surface / Ghost | Header/body structure for tabular data; variant changes surface, not semantics or row actions. |

## Disclosure

| Component / source | Candidate views | Responsibility and states |
| --- | --- | --- |
| [Accordion](../../../../apps/storybook/src/components/disclosure/accordion.stories.tsx) | Surface / Outline | One collapsible panel open at a time; first starts open, another item unavailable. The exposed disabled control is not group-wide: review gap. |
| [Collapsible](../../../../apps/storybook/src/components/disclosure/collapsible.stories.tsx) | Surface / Outline | A trigger expands/collapses supporting content; open state and disabled trigger. |

## Feedback

| Component / source | Candidate views | Responsibility and states |
| --- | --- | --- |
| [Callout](../../../../apps/storybook/src/components/feedback/callout.stories.tsx) | Soft / Outline | Inline contextual information with icon and text; no automatic success/error palette inferred from the neutral example. |
| [Progress](../../../../apps/storybook/src/components/feedback/progress.stories.tsx) | In progress / Complete | Named determinate value, 45% or 100%, with readable completion text; indeterminate not demonstrated. |
| [Skeleton](../../../../apps/storybook/src/components/feedback/skeleton.stories.tsx) | Loading / Ready | Loading/ready content replacement; avoid exposing placeholder shapes as meaningful content. |
| [Spinner](../../../../apps/storybook/src/components/feedback/spinner.stories.tsx) | Large / Compact | Large/compact indeterminate activity indicator; named loading context remains necessary. |
| [Toast](../../../../apps/storybook/src/components/feedback/toast.stories.tsx) | Solid action / Outline action | User-triggered transient local feedback; open/closed, 6000ms example duration, dismissal; no persistence. |

## Inputs

| Component / source | Candidate views | Responsibility and states |
| --- | --- | --- |
| [Checkbox cards](../../../../apps/storybook/src/components/inputs/checkbox-cards.stories.tsx) | Surface / Classic | Independent multiple selections shown as labelled cards; selected/unselected/disabled. |
| [Checkbox group](../../../../apps/storybook/src/components/inputs/checkbox-group.stories.tsx) | Surface / Soft | Multiple related values; selection changes independently, including unavailable options. |
| [Checkbox](../../../../apps/storybook/src/components/inputs/checkbox.stories.tsx) | Square / Corners | Labelled boolean/mixed input; square/corners, check/dash, size 1–3; six starting enabled/disabled examples. |
| [Form preview](../../../../apps/storybook/src/components/inputs/form.stories.tsx) | Surface / Outline | Required email format; empty/invalid/valid local submission and disabled input; no network request. |
| [Label](../../../../apps/storybook/src/components/inputs/label.stories.tsx) | Plain label / Emphasized label | Associates visible text with a field; plain/emphasized text must activate the associated enabled input. |
| [One-time password field preview](../../../../apps/storybook/src/components/inputs/one-time-password-field.stories.tsx) | Surface / Outline | Four synthetic code slots with digit labels and focus advance; enabled/disabled, no verification; unstable API. |
| [Password toggle field preview](../../../../apps/storybook/src/components/inputs/password-toggle-field.stories.tsx) | Surface / Outline | Password visibility toggle with Show/Hide label; disabled state; no authentication; unstable API. |
| [Radio cards](../../../../apps/storybook/src/components/inputs/radio-cards.stories.tsx) | Surface / Classic | Exclusive labelled card selection; selected/unselected/unavailable, surface or classic treatment. |
| [Radio group](../../../../apps/storybook/src/components/inputs/radio-group.stories.tsx) | Circle / Corners | One value within a named group; circle/corners, dot selection, empty or chosen value, unavailable option, sizes 1–3. |
| [Radio](../../../../apps/storybook/src/components/inputs/radio.stories.tsx) | Surface / Soft | Exclusive native-style choices sharing a group name; selected/unselected/disabled options. |
| [Segmented control](../../../../apps/storybook/src/components/inputs/segmented-control.stories.tsx) | Surface / Classic | One selected period represented by adjacent segments; surface/classic changes skin, not value meaning. |
| [Select](../../../../apps/storybook/src/components/inputs/select.stories.tsx) | Surface / Soft | Single named value or placeholder; open/closed, selected and unavailable choices, disabled trigger. |
| [Slider](../../../../apps/storybook/src/components/inputs/slider.stories.tsx) | Surface / Soft | Labelled numeric value and range examples; value text, single/two thumbs, enabled/disabled, keyboard/pointer adjustment. |
| [Switch](../../../../apps/storybook/src/components/inputs/switch.stories.tsx) | Filled / Corners | Immediate on/off state with moving thumb; filled-track/corners, size 1–3; disabled on/off preserved. |
| [Text area](../../../../apps/storybook/src/components/inputs/text-area.stories.tsx) | Surface / Soft | Multiline value with visible label, helper text, invalid/disabled example; preserve editable content for correction. |
| [Text field](../../../../apps/storybook/src/components/inputs/text-field.stories.tsx) | Surface / Soft | Single-line value; label/helper, illustrated invalid message, read-only identifier, disabled control. |

## Layout

| Component / source | Candidate views | Responsibility and states |
| --- | --- | --- |
| [Aspect ratio](../../../../apps/storybook/src/components/layout/aspect-ratio.stories.tsx) | 16:9 / 1:1 | Reserve media dimensions; 16:9 or square; placeholder content does not supply real image semantics. |
| [Box](../../../../apps/storybook/src/components/layout/box.stories.tsx) | Spacious / Compact | Generic spacing/content wrapper; spacious/compact are compositions, no action or selection state. |
| [Container](../../../../apps/storybook/src/components/layout/container.stories.tsx) | Narrow container / Wide container | Constrain content width; narrow/wide; preserve document reading order. |
| [Flex](../../../../apps/storybook/src/components/layout/flex.stories.tsx) | Row / Column | Arrange related items horizontally or vertically; layout choice does not change semantic order. |
| [Grid](../../../../apps/storybook/src/components/layout/grid.stories.tsx) | Two columns / Single column | Two or one columns; support reflow without introducing interaction semantics. |
| [Inset](../../../../apps/storybook/src/components/layout/inset.stories.tsx) | Top inset / Horizontal inset | Align content to a card edge at top or horizontally; retain the surrounding content padding. |
| [Section](../../../../apps/storybook/src/components/layout/section.stories.tsx) | Compact section / Spacious section | Group a content region with compact/spacious vertical rhythm; meaningful heading where appropriate. |
| [Separator](../../../../apps/storybook/src/components/layout/separator.stories.tsx) | Horizontal / Vertical | Horizontal/vertical dividing rule; choose decorative versus semantic separation deliberately. |

## Navigation

| Component / source | Candidate views | Responsibility and states |
| --- | --- | --- |
| [Context menu](../../../../apps/storybook/src/components/navigation/context-menu.stories.tsx) | Surface / Outline | Context-triggered action list with unavailable item and local status feedback; open/navigation/dismissal. |
| [Dropdown menu](../../../../apps/storybook/src/components/navigation/dropdown-menu.stories.tsx) | Solid trigger / Outline trigger | Trigger opens action list; selection reports local feedback; disabled entries and dismissal. |
| [Link](../../../../apps/storybook/src/components/navigation/link.stories.tsx) | Always underlined / Underline on hover | Navigation with always/hover underline candidates; destination and focus distinguish it from plain text. |
| [Menubar](../../../../apps/storybook/src/components/navigation/menubar.stories.tsx) | Surface / Outline | Application menu navigation; local action feedback and checked guides option; unavailable publishing action. |
| [Navigation menu](../../../../apps/storybook/src/components/navigation/navigation-menu.stories.tsx) | Surface / Outline | Project links and expandable navigation content; open/current/destination meaning; local anchors only. |
| [Tab nav](../../../../apps/storybook/src/components/navigation/tab-nav.stories.tsx) | Compact navigation / Comfortable navigation | Navigation-like section selection, compact/comfortable; sample intercepts links and changes local section text. |
| [Tabs](../../../../apps/storybook/src/components/navigation/tabs.stories.tsx) | Compact tabs / Comfortable tabs | One active tab and associated panel, compact/comfortable; preserve tab/panel relationship and keyboard navigation. |
| [Toolbar](../../../../apps/storybook/src/components/navigation/toolbar.stories.tsx) | Surface / Outline | Grouped preview action, multiple formatting toggles, and local help link; internal keyboard navigation. |

## Overlays

| Component / source | Candidate views | Responsibility and states |
| --- | --- | --- |
| [Alert dialog](../../../../apps/storybook/src/components/overlays/alert-dialog.stories.tsx) | Solid trigger / Outline trigger | Confirm/cancel consequential action with labelled modal surface and status; reset is a local demonstration. |
| [Dialog](../../../../apps/storybook/src/components/overlays/dialog.stories.tsx) | Solid trigger / Outline trigger | Open/close editable local name, save/cancel and status; labelled surface, modal focus, return to trigger. |
| [Hover card](../../../../apps/storybook/src/components/overlays/hover-card.stories.tsx) | Below / To the right | Supplementary author detail below/right; pointer/focus discovery; no essential instructions only on hover. |
| [Popover](../../../../apps/storybook/src/components/overlays/popover.stories.tsx) | Solid trigger / Outline trigger | Anchored reading-options surface and Done close action; open/closed and return route. |
| [Tooltip](../../../../apps/storybook/src/components/overlays/tooltip.stories.tsx) | Above / To the right | Short help for an already named icon button, above/right; supplementary pointer/focus content. |

## Typography

| Component / source | Candidate views | Responsibility and states |
| --- | --- | --- |
| [Blockquote](../../../../apps/storybook/src/components/typography/blockquote.stories.tsx) | Reading / Compact | Semantic quotation at reading/compact density; no interaction states. |
| [Code](../../../../apps/storybook/src/components/typography/code.stories.tsx) | Soft / Outline | Inline code token distinguished from prose; soft/outline; do not turn code styling into an action. |
| [Em](../../../../apps/storybook/src/components/typography/em.stories.tsx) | Reading / Compact | Semantic emphasis in reading/compact text; Inter follows the shared body typography rule. |
| [Heading](../../../../apps/storybook/src/components/typography/heading.stories.tsx) | Editorial / Interface | Editorial/interface visual size plus supporting heading; semantic level remains independent of size. |
| [Kbd](../../../../apps/storybook/src/components/typography/kbd.stories.tsx) | Large keys / Compact keys | Present a keyboard key/chord at large/compact scale; informational, not a clickable key. |
| [Quote](../../../../apps/storybook/src/components/typography/quote.stories.tsx) | Reading / Compact | Inline quotation at reading/compact density; preserve quote semantics and use Inter under the shared typography rule. |
| [Strong](../../../../apps/storybook/src/components/typography/strong.stories.tsx) | Reading / Compact | Semantic importance at reading/compact density; appearance does not replace semantic markup. |
| [Text](../../../../apps/storybook/src/components/typography/text.stories.tsx) | Body text / Compact text | Body/compact readable content with secondary information; wrap and resize without truncating meaning. |

## Utilities

| Component / source | Candidate views | Responsibility and states |
| --- | --- | --- |
| [Accessible icon](../../../../apps/storybook/src/components/utilities/accessible-icon.stories.tsx) | Continue label / Details label | Name otherwise ambiguous icon-only content; Continue/Details are label examples, not visual variants. |
| [Direction provider](../../../../apps/storybook/src/components/utilities/direction.stories.tsx) | Left to right / Right to left | LTR/RTL composition context; direction behaviour alone does not provide a translation. |
| [Icons](../../../../apps/storybook/src/components/utilities/icons.stories.tsx) | Foreground / Secondary foreground | Foreground/muted presentation of Radix utility indicators; does not replace the proposed Font Awesome website vocabulary. |
| [Portal](../../../../apps/storybook/src/components/utilities/portal.stories.tsx) | Surface / Outline | Toggle content rendered outside its original subtree; shared appearance and meaningful DOM/accessibility relationships. |
| [Reset](../../../../apps/storybook/src/components/utilities/reset.stories.tsx) | Surface / Outline | Remove browser element defaults for composition; preserve semantic role and operability. |
| [Slot](../../../../apps/storybook/src/components/utilities/slot.stories.tsx) | Surface / Outline | Apply composition props to an existing child; keep one semantic interactive element and its accessible name. |
| [Theme panel](../../../../apps/storybook/src/components/utilities/theme-panel.stories.tsx) | Neutral accent / Bronze accent | Interactive theme exploration with gray/bronze candidates and Copy action; not a production end-user setting contract. |
| [Theme](../../../../apps/storybook/src/components/utilities/theme.stories.tsx) | Light boundary / Dark boundary | Light/dark nested boundary; context description reflects appearance/accent; consistency across child surfaces. |
| [Visually hidden](../../../../apps/storybook/src/components/utilities/visually-hidden.stories.tsx) | Solid action / Outline action | Retain a text name for an icon button without a visible label; solid/outline only changes its surface. |

## Coverage boundaries and review gaps

Themes wrappers may cover the equivalent Primitive family; the inventory does not require duplicate unstyled versions of each interaction. Utility helpers such as ThemeContext/useThemeContext are supporting capabilities, not independent visible controls. Installed export coverage is checked by the existing [manifest](../../../../apps/storybook/src/components/catalogue.json); it is not a guarantee of complete Core UI state coverage.

Form and password/code-field APIs remain preview/unstable. Their presence does not select them for production or establish authentication behaviour. Toggle group and Accordion currently expose a `disabled` control that does not disable the whole group; the individual unavailable items still demonstrate disabled state. These are review gaps to resolve or remove before claiming complete control coverage, not changes made during this documentation extraction.

## Verification

Compare the inventory with all manifest study titles and their source files, and verify each row's candidate names against Comparison. In the running catalogue, check the common state contract and the row's selection/expansion/dismissal behaviour in both appearances. Resolve final variants, preview API inclusion, and missing state combinations under the [proposal open questions](README.md#open-questions). Exploratory checks and their limits are recorded in the [prototype reference](../../reference/storybook-prototype.md#verification-and-sources); this document does not imply another complete browser or accessibility audit.

## Revisions

| Revision | Date | Author | Description |
| --- | --- | --- | --- |
| 1        | 2026-10-18 | Akane SHIMOKA | Initial draft |
