---
id: core-ui
standard_revision: 1
status: draft
---

# Core UI

## Summary

Core UI proposes a complete White Eclipse theme, a styled React component library built on Radix Themes, and a native Obsidian theme. Applications receive the shared palette, typography, controls, and common compositions rather than assembling an interface from raw primitives.

The components provide the visual starting point: warm off-white and charcoal surfaces, flat controls, precise corner frames, and restrained motion. Core UI will also own repeated controls such as the language switch. Consumers must be able to include only the components and styles they use.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the MIT License. See the root [LICENCE](https://github.com/whiteeclipse-studio/hypatia/blob/main/LICENCE).

## Requirement terminology

Uppercase requirement keywords follow IETF BCP 14, as defined by [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174). They carry those meanings only when written entirely in uppercase. Requirements in this draft do not record owner acceptance.

## Context and scope

Core UI serves White Eclipse's websites and applications. It supplies a consistent interface while leaving page content, routes, data, and deployment to each application.

The proposal covers:

- A complete light/dark theme with shared colour, typography, spacing, focus, and motion rules.
- Styled controls, typography, layout components, and overlays based on Radix Themes.
- Core UI-owned components, starting with `LanguageSwitch`, `WhiteEclipseBrand`, and `ActionLink`.
- Modular delivery so a small consumer can omit unrelated component code and styles.
- A native Obsidian app theme sharing the same visual foundations, with light/dark reading and editing surfaces.

Radix Primitives MAY be used internally when Themes has no suitable component. Applications MUST NOT need raw primitives to use the supported Core UI library. Core UI MUST expose explicit supported components rather than a blanket upstream namespace.

The web and Obsidian themes share semantic colour and typography roles. Obsidian retains its native layout, editing behaviour, preferences, and controls; it does not load React or Radix components.

The theme is prescriptive about visual defaults and interaction states. Applications select documented variants and compose their own pages; they do not need to recreate the brand styling for each control.

The landing and documentation samples illustrate composition. Their copy, routes, artwork, and page measurements are not required application layouts. The language switch presents a supplied locale and available choices; application localization owns changing language, persistence, and translated-document navigation.

### Rewrite and historical reference

The previous implementation was removed for the repository rewrite. Its [source snapshot](https://github.com/whiteeclipse-studio/hypatia/tree/25f35669fe3116680d11e7040f38eea9e47edd3f) and retained captures remain design references. They are not a working catalogue or evidence that the new library exists.

This revision replaces the earlier extraction-only direction. Shared values and behaviour remain in the implementation rules; historical alternatives stay identified as alternatives. No rebuilt components, tree-shaking results, or new browser validation are claimed.

## Documentation index

- [Inspirations](inspirations/README.md): visual direction and Radix Themes foundation.
- [Mockups](mockups.md): retained visual samples and their historical limits.
- [Implementation rules](implementation-rules.md): theme defaults, owned controls, modular delivery, and review criteria.
- [Component catalogue](components.md): proposed library responsibilities.

## User journeys

**Build an interface.** An application imports the Core UI theme and the components it needs. Controls share the intended styling, focus, and states without application-specific copies of those styles. A small page can omit dialogs, menus, optional branding, and decorative backgrounds it does not use.

**Choose a language.** A visitor uses the shared language switch. The selected locale is visible and available choices have accessible names. The application applies the change and supplies the resulting value, pending state, or error. The component does not choose persistence or navigation policy.

**Use Obsidian.** A user installs the White Eclipse theme, selects light or dark appearance, and reads or edits notes with the same visual identity. Native font preferences, keyboard focus, and note content remain usable offline.

**Operate controls.** A visitor follows links, activates actions, changes values, and opens overlays using their expected pointer and keyboard interactions. Selection remains clear after hover ends; dismissal and errors leave an understandable way to continue.

**Review the library.** The rebuilt Storybook MUST demonstrate the supported Core UI components, variants, states, and main interactions in both appearances. The review inventory is the Core UI API, not every export of an installed dependency.

## Consequences and alternatives

A full theme and owned components reduce repeated composition and styling. They also give Core UI responsibility for its public API, accessibility, visual consistency, and dependency upgrades. The library deliberately offers fewer choices than exposing all upstream props and variants.

Radix Themes provides the styled foundation. Raw primitives remain an internal option for gaps; a primitive-only public toolkit would move too much composition back into applications. An unmodified Themes re-export would preserve the previous application's styling work rather than consolidate it.

Modular styles require separate attention from JavaScript tree-shaking. A full stylesheet can be offered for convenience, but it cannot be the only way to consume the theme. The exact packaging approach must be validated against the chosen upstream version before it becomes a supported contract.

## Validation

Review MUST cover the [component contracts](components.md), [visual and accessibility rules](implementation-rules.md), and retained mockups. The rebuilt deployed catalogue MUST show the supported controls in light/dark appearance, including keyboard focus, disabled/loading/error states where relevant, narrow layouts, and long labels.

The Obsidian theme MUST be reviewed separately in the native app: light/dark appearance, Reading view, Live Preview, source editing, navigation, settings, and representative note content. Mobile layout and print output also need review; unsupported plugin-specific surfaces must be identified. Browser Storybook checks do not establish native-app compatibility.

The library MUST also be built and consumed through its public package exports. A minimal consumer MUST retain the theme and used control styles while excluding unrelated components, styles, and optional assets. Compare selective imports with a broader consumer and record the resulting module and stylesheet inventories. An ESM export declaration alone does not establish tree-shaking support.

Previous prototype observations are historical only. Rebuilt component, bundle, browser, accessibility, and deployment checks remain planned. Complete review and explicit human acceptance are required before the design is accepted; the decision record must identify the owner, date, approval reference, reviewed catalogue build, fixed source snapshot, approved README revision, and covered supporting document revisions and assets.

## Open questions

| Question                                                    | Resolution condition                                                                                                                                                                                      |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Which historical variants become supported?                 | Choose and document variants for each exported control. The historical comparison stories do not automatically become public API.                                                                         |
| How will modular CSS be delivered?                          | Validate a package build that preserves the required theme/component styles and excludes unrelated CSS. Account for upstream CSS dependencies and licence notices.                                        |
| Which preview components are included?                      | Review form, password, and code-field stability before exposing them. Omit unselected upstream exports.                                                                                                   |
| Which semantic colours and accessibility support are final? | Resolve feedback colour roles, contrast, supported browsers, and assistive-technology scope before acceptance. WCAG 2.2 AA remains the proposed review target.                                            |
| Which Obsidian versions and surfaces are supported?         | Confirm the minimum app version, desktop/mobile coverage, font fallback, and plugin limits against the generated theme before release. Community-directory submission is a separate publication decision. |
| Which composition details need adjustment?                  | Review long locale names, dense content, typography fallbacks, and optional backgrounds in the rebuilt catalogue.                                                                                         |

The language-switch ownership and presentation contract are proposed in the implementation rules. Its final TypeScript signatures and the packaging implementation remain part of RFC-0002's delivery work. Application content, locale persistence, and routing stay outside Core UI.

## Decision record

Draft revision 2; owner acceptance is pending. This revision proposes a Radix Themes foundation, an owned component library, selective code/style delivery, and a native Obsidian theme. It does not establish implementation, release, or approval of any RFC.

The review set consists of this README, `core-ui-implementation-rules`, `core-ui-components`, `core-ui-mockups`, `core-ui-inspirations`, its linked source pages, and the referenced assets. Earlier decisions and revision history remain preserved.

## Revisions

| Revision | Date       | Author        | Description                                                                                                     |
| -------- | ---------- | ------------- | --------------------------------------------------------------------------------------------------------------- |
| 1        | 2026-10-17 | Akane SHIMOKA | Initial draft                                                                                                   |
| 2        | 2026-10-25 | Codex         | Propose the styled component library, selective delivery, owned controls, and a matching native Obsidian theme. |
