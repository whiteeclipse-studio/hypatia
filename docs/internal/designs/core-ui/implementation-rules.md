---
id: core-ui-implementation-rules
---

# Core UI — Implementation rules

Part of the [design proposal](README.md). See [mockups](mockups.md) for visual examples and the [component catalogue](components.md) for each study's purpose and candidates.

## Overview

These are proposed design rules extracted from the current exploratory browser prototype. They describe the intended shared vocabulary, its current candidate values, and unresolved boundaries. They are authoritative within this draft design set, not an accepted production specification. Mockup-only values are identified separately.

The prototype uses React, Vite, Bun, Radix Themes 3.3.0, and Radix Primitives through `radix-ui` 1.8.1. Those technologies and package boundaries remain exploratory under draft [RFC-0002](../../rfcs/0002-tech-stack.md). Platform-independent rules concern perception, semantics, state, and navigation; CSS names below are the current web expression of those rules. Current implementation facts and installed API coverage belong in the [prototype reference](../../reference/storybook-prototype.md) and [package reference](../../packages/core-ui/README.md).

## Copyright and licence

Copyright © 2026 White Eclipse.

This document is released under the MIT License. See the project's root [LICENCE](../../../../LICENCE) file for the complete licence text.

## Requirement terminology

Uppercase requirement keywords follow IETF **BCP 14**, as defined by [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and clarified by [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174). **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **NOT RECOMMENDED**, **MAY**, and **OPTIONAL** carry those meanings only when written entirely in uppercase. They specify the proposed design, not owner approval.

## Building blocks

The [area-based catalogue](components.md) lists all 73 current studies, their two comparison candidates, semantic responsibilities, and state contracts. Each has Playground and Comparison views. A candidate may represent density, placement, orientation, or state rather than an alternative skin. Nonvisual utilities retain their real composition responsibilities.

Consumers compose typography, layout, content, and controls rather than reproducing a page screenshot as a single image. Shared rules MUST apply consistently to equivalent states. Component-specific contracts supplement the common rules below. Demonstration controls and sample content are not a new application API; exact production props, package exports, and dependency adoption remain technical decisions.

### Common state contract

| State or input                      | Proposed responsibility                                                                                     | Current evidence or limit                                                                                     |
|-------------------------------------|-------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| Default                             | Expose a readable name, role, and current value/state; distinguish actions from content.                    | All studies offer a baseline specimen.                                                                        |
| Hover                               | Add a transient cue without moving or resizing the control.                                                 | Corner frames extend; other candidates retain their library treatment.                                        |
| Keyboard focus                      | Keep a separate visible focus indicator; selection or hover MUST NOT be its only cue.                       | 2px foreground outline, offset 3px. Focus verification is representative, not exhaustive.                     |
| Activation                          | Buttons activate actions; links navigate; selection controls change their declared state.                   | Preview actions change local demonstration state only.                                                        |
| Selected or expanded                | Persist selection/expansion after hover ends and expose it semantically.                                    | Fill, marker, dot, check, thumb position, active tab, or expanded panel, as appropriate.                      |
| Disabled                            | Suppress activation while preserving a recognizable control and visible current value.                      | Disabled examples and controls are available where relevant; disabled native controls leave sequential focus. |
| Loading                             | Preserve the action's context and dimensions; prevent duplicate activation and expose a useful busy status. | Button loading and spinner/skeleton studies exist; announcement and complete async flows still need review.   |
| Invalid                             | Associate a specific error with the field and preserve editable input for correction.                       | Invalid text-field and local form examples; final semantic colour/contrast choices remain open.               |
| Empty, success, failure, permission | Provide meaningful text and a recovery/next action when the consuming workflow needs it.                    | Not universal component states. The sample does not implement server, authorization, or network flows.        |

## Visual rules

### Colour and theme

Warm off-white `#f6f4ef` and charcoal `#211f26` anchor the proposal. Light and dark appearances use the same semantic roles with different values. Consumers SHOULD use roles rather than a light-theme hex value in every control. The supplied company logo MUST match the active surface appearance, including after an in-application theme change.

The extracted opaque scale is:

| Token     | Light     | Dark      | Intended role          |
|-----------|-----------|-----------|------------------------|
| `gray-1`  | `#f6f4ef` | `#211f26` | Page background        |
| `gray-2`  | `#eeece5` | `#29272e` | Panel/surface          |
| `gray-3`  | `#e6e3da` | `#333138` | Soft surface           |
| `gray-4`  | `#dedbd0` | `#3c3940` | Subtle active surface  |
| `gray-5`  | `#d4d0c3` | `#46424a` | Subtle boundary        |
| `gray-6`  | `#c7c2b4` | `#534e57` | Dividing rule          |
| `gray-7`  | `#b5ae9f` | `#69636c` | Control boundary       |
| `gray-8`  | `#948c7d` | `#837b85` | Disabled/muted control |
| `gray-9`  | `#45413b` | `#d4d0c3` | Indicator/track        |
| `gray-10` | `#36322e` | `#e2ded3` | Strong tonal emphasis  |
| `gray-11` | `#625c52` | `#b9b3bb` | Secondary foreground   |
| `gray-12` | `#211f26` | `#f6f4ef` | Primary foreground     |

The roles describe proposed use, not a guarantee that every foreground/background pairing passes contrast review. The corresponding twelve translucent values, extracted from the same theme, are:

| Token      | Light       | Dark        |
|------------|-------------|-------------|
| `gray-a1`  | `#3c300004` | `#f6f4ef05` |
| `gray-a2`  | `#3c30000c` | `#f6f4ef0a` |
| `gray-a3`  | `#3c300016` | `#f6f4ef14` |
| `gray-a4`  | `#3c300021` | `#f6f4ef1f` |
| `gray-a5`  | `#3c30002e` | `#f6f4ef29` |
| `gray-a6`  | `#3c300041` | `#f6f4ef38` |
| `gray-a7`  | `#3c300057` | `#f6f4ef52` |
| `gray-a8`  | `#3c300080` | `#f6f4ef73` |
| `gray-a9`  | `#211f26d6` | `#f6f4efd9` |
| `gray-a10` | `#211f26e8` | `#f6f4efeb` |
| `gray-a11` | `#211f26b3` | `#f6f4efb3` |
| `gray-a12` | `#211f26`   | `#f6f4ef`   |

The current aliases map page background to `gray-1`; solid/translucent panels and general surfaces to `gray-2`; indicators and tracks to `gray-9`; contrast foreground to off-white in light appearance and charcoal in dark appearance. The neutral theme uses gray accent and sand gray-family configuration. Error/destructive examples currently use upstream red; final feedback colour tokens remain a [material open question](README.md#open-questions). Coloured project artwork is not an interface status palette.

Theme values MUST remain consistent across nested surfaces and overlays rendered outside their original container. The prototype applies the same overrides at inherited Radix theme boundaries; opening a dialog or menu does not reset appearance to light. Theme configuration controls in the catalogue are experiments, not permission to vary brand roles arbitrarily.

### Typography and hierarchy

Typography MUST use the following roles consistently:

| Role                                                           | Font family    | Web stack / token                                                                                                           |
|----------------------------------------------------------------|----------------|-----------------------------------------------------------------------------------------------------------------------------|
| White Eclipse brand name                                       | Outfit         | `'Outfit', 'Inter', sans-serif`; `--brand-font-family`                                                                      |
| Semantic h1 and h2 headings                                    | Outfit         | `'Outfit', 'Inter', sans-serif`; `--display-font-family`                                                                    |
| Body, controls, h3–h6 headings, emphasis, and quotations       | Inter          | `'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif`; `--default-font-family` and default heading/emphasis/quote roles |
| Code and other monospace text, including interface annotations | JetBrains Mono | `'JetBrains Mono', 'SFMono-Regular', Consolas, monospace`; `--code-font-family`                                             |

The web stylesheet MUST load these families from Google Fonts using its [CSS v2 API](https://developers.google.com/fonts/docs/css2), with `display=swap` and fallback stacks so content remains readable while fonts load or when the service is unavailable. The current request covers weights 300–700 for all three families and true italics for Inter and JetBrains Mono. Outfit is requested upright for the brand and display headings. The shared stylesheet owns the request; individual components MUST NOT independently reload the fonts. These roles also apply to nested theme and portal surfaces. External font loading requires access to `fonts.googleapis.com` and `fonts.gstatic.com`; blocked/offline loading falls back and may alter wrapping. The semantic h1/h2 role determines Outfit usage independently of a component's visual size. Emphasis and inline quotation retain their semantics while inheriting Inter rather than upstream serif defaults.

At the prototype's default 100% scaling, the text scale is:

| Size | Font size | Body line height |
|------|-----------|------------------|
| 1    | 12px      | 16px             |
| 2    | 14px      | 20px             |
| 3    | 16px      | 24px             |
| 4    | 18px      | 26px             |
| 5    | 20px      | 28px             |
| 6    | 24px      | 30px             |
| 7    | 28px      | 36px             |
| 8    | 35px      | 40px             |
| 9    | 60px      | 60px             |

The default body is 16px with 1.5 line height. Typography components supply their own semantic heading/emphasis adjustments; the body table is not a heading line-height contract. Font weights in the underlying scale are light 300, regular 400, medium 500, and bold 700. Candidate-specific 600-weight labels remain local.

Headings MUST preserve logical document hierarchy independently of visual size. Short uppercase annotations may use wide tracking; long prose, field labels, and navigation labels SHOULD remain easy to scan without artificial spacing. The landing's editorial headings are examples, not replacements for every component heading size.

### Spacing, sizing, and surfaces

The spacing scale at 100% is 4, 8, 12, 16, 24, 32, 40, 48, and 64px (`space-1` through `space-9`). Related controls use a smaller gap than separate content sections. Layout MUST preserve readable order when columns stack or labels wrap.

Shared surfaces are flat. The default radius is zero; this does not replace a radio's circular selection symbol or remove a switch thumb's distinct shape. Decorative elevation shadows are disabled. Use a single-pixel border/divider or a subtle inset stroke where a surface needs definition. The current button inset stroke uses translucent boundary role `gray-a6`; primitives generally use `gray-7` for control boundaries and `gray-2` for their surface. Candidate variants may deliberately strengthen these boundaries.

Control size selection stays component-specific: primary/icon buttons expose sizes 1–4, while the early checkbox/radio-group/switch studies expose 1–3. The draft does not invent a universal control-height table or touch-target guarantee from those indexes. Production size mapping and minimum target policy need review before acceptance.

### Corner-frame controls and motion

The primary action has a transparent resting surface and eight 1px strokes, two per corner, initially 8px long in each direction. Hover or visible keyboard focus extends opposing strokes until they form a continuous border, with no layout shift. Retraction uses the same 180ms ease-out transition. The plain candidate has no extra symbol; the marker candidate adds a 6px square. Neither candidate is formally selected by this extraction.

The corner icon-button treatment uses the same frame. Toggle candidates retain their selected state after hover: the fill treatment inverts foreground/background, while the marker treatment fills its square and completes its frame. Checkbox, radio, and switch corner candidates use initial 4px strokes. Their check/dash, circular dot, or moving thumb MUST remain distinguishable from frame decoration. Disabled and loading action frames do not animate; disabled foreground currently uses `gray-8`.

Motion MUST support comprehension without delaying activation. Reduced-motion preferences suppress visible transitions and decorative animation. The web prototype sets animation/transition durations to 0.01ms with one animation iteration and disables smooth scrolling; the near-zero duration preserves completion events. No global animation duration is defined for every overlay. Final per-component overlay timings remain part of variant review.

### Icons, logo, and imagery

Foldable items use a [plus](../../../../packages/platform/core-ui/src/assets/disclosure-plus.svg) when collapsed and a [minus](../../../../packages/platform/core-ui/src/assets/disclosure-minus.svg) when expanded. Four separated 3px corner segments frame the symbol with 1px strokes, inset 1px in a 16 × 16px indicator. The shared stylesheet draws the marker with `currentColor` background layers; the linked SVG studies show the earlier static treatment. Hover and visible keyboard focus extend opposing strokes to 50% over 180ms ease-out, completing the square as on the buttons; exit retracts them. Disabled triggers retain the resting frame. Reduced-motion preferences suppress visible animation. Plus/minus state still changes immediately without rotation. Native summaries and opted-in Accordion/Collapsible triggers share the markers. Hover/focus inversion preserves the symbol; labels, disabled states, expansion semantics, and keyboard behaviour remain native or Radix responsibilities.

Font Awesome is the proposed website icon vocabulary explored in the landing mockup. Use icons consistently, retain visible labels where useful, and provide an accessible name on any icon-only action. Decorative icons MUST NOT duplicate their adjacent label in the accessibility tree. Library-supplied semantic indicators may remain where replacing them would harm meaning or interaction; the existing Radix utility icon studies remain explicit comparison material, not a completed icon migration.

The company logo is a supplied image asset, separate from Font Awesome. Preserve its aspect ratio and colours; select the dark mark for a light surface and the pale mark for a dark surface. When adjacent text already names White Eclipse, the repeated image uses empty alternative text; a standalone linked logo needs an accessible destination/name. The sample's 64px logo box (48px on narrow layouts) is a composition measurement, not a universal logo minimum or clear-space standard.

The [orbital and eclipse images](mockups.md#generated-placeholder-assets) are generated temporary artwork. They demonstrate how images can sit alongside shared components; they are not reusable control graphics, final portfolio models, or a new status colour system. The page and component mockups MUST remain rendered from components rather than replacing the interface with a generated screenshot.

### Optional woven background

The background study translates the reference into White Eclipse colours without the ornamental side rails. It is optional for composed surfaces; plain page/panel backgrounds remain valid for dense reading, forms, and overlays. The landing and documentation samples both use the fixed woven texture and geometry from one [shared sample stylesheet](../../../../apps/storybook/src/samples/woven-background.css). The documentation sample restores this treatment behind its reading layout; it does not change the geometry or ink values below.

| Property                 | Extracted proposed value                                                                          |
|--------------------------|---------------------------------------------------------------------------------------------------|
| Base surface             | `gray-1` in the active appearance                                                                 |
| Cross-weave              | Two orthogonal 1px strokes in a 6 × 6px tile                                                      |
| Weave ink                | `gray-12` mixed at 3% with transparency                                                           |
| Geometry ink             | `gray-12` mixed at 7% with transparency                                                           |
| Arc centre               | Viewport top-right corner                                                                         |
| Inner radius             | `clamp(280px, 35vw, 560px)`                                                                       |
| Paired radius separation | 80px                                                                                              |
| Arc stroke               | Approximately 1px with gradient edge smoothing                                                    |
| Diagonals                | Three parallel 135° gradient bands, approximately 2px wide and 80px apart along the gradient axis |
| Central diagonal         | Passes through the same top-right centre as the arcs                                              |
| Scrolling                | Texture and geometry stay fixed to the viewport; content scrolls above them                       |

The drawing uses a square with side `max(100vw, 100vh)` aligned top-right, so its 135° centre line and radial centre coincide at every aspect ratio. It MUST NOT intercept pointer input, create focusable content, animate, or cause horizontal overflow. Fine lines and texture are decorative; meaningful text and component boundaries still require their own sufficient contrast. Forced-colour and full browser/assistive-technology behaviour remain unverified. An application may omit this treatment when it competes with content.

### Landing-only composition measurements

These values describe the mockup, not mandatory Core UI page geometry:

| Aspect             | Mockup value or behaviour                                                                     |
|--------------------|-----------------------------------------------------------------------------------------------|
| Content frame      | Maximum 1280px; desktop padding 24px 48px 0; narrow padding 20px 24px 0                       |
| Hero               | Two columns `1fr 1.05fr`, 40px gap; desktop vertical padding 64px/60px                        |
| Hero headline      | 400 weight, `clamp(40px, 5.4vw, 68px)`, line-height 1.04, tracking −0.055em                   |
| Section heading    | 400 weight, `clamp(32px, 4vw, 50px)`, line-height 1.08, tracking −0.045em                     |
| Short annotations  | 12px monospace, uppercase, tracking 0.08em                                                    |
| Service icons      | 44 × 44px boxes                                                                               |
| Tablet change      | At 1000px or below, navigation can wrap and services become two columns                       |
| Phone change       | At 640px or below, hero/studio/final sections stack; hero title uses `clamp(34px, 9vw, 48px)` |
| Small-phone change | At 380px or below, services become one column                                                 |

The generic comparison frame uses two columns with 32px gaps/padding and stacks at 720px or below with 24px padding. Earlier checkbox/radio specimens stack at 640px or below. These catalogue presentation values are not application navigation breakpoints. The landing's section order, wording, available links, and generated illustrations remain illustrative.

## Interaction and accessibility

The proposed web review target is [WCAG 2.2 Level AA](https://www.w3.org/TR/2024/REC-WCAG22-20241212/), subject to owner confirmation and the support scope in [open questions](README.md#open-questions). No conformance result is claimed. The W3C [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) supplies informative pattern guidance; its [keyboard interface guidance](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) distinguishes Tab movement between controls from navigation inside composite widgets. Use native semantics where they fit the task.

- **Focus and activation:** Tab/Shift+Tab follow meaningful order. Buttons support their expected keyboard activation; links navigate on Enter. A visible 2px foreground focus outline with 3px offset remains separate from hover/selection. Overlay or decorative layers MUST NOT hide focus.
- **Selection:** Checkbox activation toggles checked state; the mixed checkbox example becomes checked on activation. Radio groups keep one selected value and expose it with a dot. Arrow navigation skips disabled choices. Switches communicate on/off with thumb position. Toggle actions expose pressed state and keep a stable action name.
- **Composite navigation:** Menus, tabs, toolbars, selects, and groups use the appropriate internal keyboard pattern rather than adding every item indiscriminately to the page Tab sequence. Implementations MUST document activation and dismissal behaviour per component; library defaults alone are not a verification result.
- **Overlays:** Dialogs expose a title and useful description, contain focus when modal, support cancellation, and restore focus appropriately. Escape/outside dismissal is applied according to the component's interaction pattern. Confirmation dialogs provide an understandable cancel route; tooltips/hover cards do not become the only place essential instructions are available.
- **Fields and feedback:** Visible labels identify inputs; descriptions and errors are associated with their control. Invalid input remains correctable. Read-only differs from disabled. Status text is exposed without moving focus unnecessarily. Toasts are supplementary feedback, not the sole record of a critical outcome.
- **Themes and decoration:** Portalled content inherits the active appearance. Colour alone does not convey selection or failure. Backgrounds and ornamental artwork have no interactive role. Contrast review includes the actual textured surface and every active/disabled/selected treatment where applicable.
- **Adaptation:** Long labels, 200% text resizing, narrow layouts, touch, and right-to-left reading need review. Direction-provider examples demonstrate a capability rather than a translated product. The landing's FR control is deliberately unavailable; EN is a displayed state, not an implemented language switch.

The proposed WCAG review includes text/non-text contrast, reflow, visible/unobscured focus, keyboard access, labels, error identification, status messages, and target size. Resolve actual exceptions and supported contexts during review rather than treating a muted border or a compact mockup as proof of compliance.

## Verification

Use the [README validation](README.md#validation) for the complete proposal and the [component contracts](components.md) to select observable checks. The [mockups](mockups.md) contain static evidence; the [prototype reference](../../reference/storybook-prototype.md#verification-and-sources) records executed commands and manual observations.

| Review        | Observable check                                                                                                                               | Current status                                                                                                    |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| Inventory     | Each listed study has Playground/Comparison; installed exports are mapped; samples counted separately.                                         | Coverage check rerun on 2026-10-20; 73 studies, 146 component stories, two page samples.                          |
| Typography    | Brand and h1/h2 use Outfit, body and smaller headings use Inter, monospace uses JetBrains Mono; verify loaded families and fallback rendering. | Role declarations and Google Fonts request checked statically; live font loading and rendering remain unverified. |
| Primary frame | Eight corner strokes complete/retract in 180ms without layout shift; disabled/loading do not animate.                                          | Representative manual observations and captures exist.                                                            |
| Selection     | Check/dot/thumb/pressed state remains visible and semantically available before and after interaction.                                         | Early focused controls checked; full candidate/state matrix pending.                                              |
| Theme         | Text, controls, logo, nested panels, menus, and dialogs retain intended light/dark roles.                                                      | Representative browser checks exist; full combination review pending.                                             |
| Background    | Fixed placement survives scroll; centre diagonal meets shared arc centre; radii differ by 80px; no horizontal overflow.                        | Desktop top/scrolled light/dark observations recorded.                                                            |
| Adaptation    | Narrow/long/zoomed content preserves order and usable actions; no clipped names or hidden focus.                                               | Landing inspected at 320px; complete component coverage pending.                                                  |
| Accessibility | Check the declared WCAG target, keyboard patterns, screen readers, contrast, reduced motion, and forced colours.                               | Complete audit and conformance evidence pending.                                                                  |
| Build/runtime | Use repository type, build, and coverage checks, then render and exercise stories.                                                             | Earlier prototype passes recorded; this extraction changes documentation only.                                    |

For this documentation extraction, metadata, required section order, local links and heading anchors, referenced assets, sequential revision histories, all 73 study references, and opaque/translucent colour values were checked against the current sources. The existing catalogue coverage check passed again. A fresh full-page landing capture was visually inspected. At that extraction, application source was unchanged; application builds and unit/integration/accessibility suites were not rerun for that documentation-only change. Earlier build and interaction evidence remains identified separately.

For the 2026-10-20 typography/background update, type checks, both builds, and catalogue coverage passed. Source review checked shared font roles, both background consumers, and wireframe XML. Browser font loading, final wrapping, scrolling, contrast, and narrow-layout rendering remain unverified because local browser access was declined earlier in this session. Unit/integration tests were omitted for this exploratory update.

Extraction sources: [shared theme](../../../../packages/platform/core-ui/src/styles.css), [theme boundary](../../../../packages/platform/core-ui/src/theme.tsx), [early control styles](../../../../apps/storybook/src/preview.css), [catalogue styles](../../../../apps/storybook/src/catalogue.css), [landing styles](../../../../apps/storybook/src/samples/landing/landing.css), and the per-component source links in [Components](components.md). These identify the current exploratory implementation rather than an adopted technical specification.

Existing exploratory evidence includes representative dialog focus/Escape restoration, menu action feedback, select navigation past disabled choices, form validation, password visibility, sequential synthetic code entry, and toast triggering/dismissal. It does not establish production authentication, data submission, error recovery, or permission enforcement. Unit/integration and automated accessibility suites were omitted during exploratory implementation. Before promotion, complete the required design review and reassess production test coverage; do not equate export coverage with state coverage or acceptance.

For the 2026-10-20 disclosure-chevron update, type checks, both builds, and catalogue coverage passed (73 studies, two samples, 148 stories). Browser checks confirmed accordion and collapsible expansion, native directory expansion with the pointer retained on the focused row, and light/dark accordion rendering. Static checks confirmed the supplied SVG path/fill rule, local documentation link targets, metadata, notices, and sequential revision entries. Unit/integration tests were omitted for this exploratory change; mobile, reduced-motion, forced-colour, and assistive-technology behaviour were not exercised. Human design and RFC acceptance remain pending.

## Revisions

| Revision | Date       | Author        | Description   |
|----------|------------|---------------|---------------|
| 1        | 2026-10-17 | Akane SHIMOKA | Initial draft |
