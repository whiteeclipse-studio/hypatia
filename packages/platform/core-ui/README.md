---
id: core-ui-package-readme
standard_revision: 1
---

# @whiteeclipse/core-ui

Shared Radix Themes-compatible styles for White Eclipse applications and a derivative native Obsidian theme. This README covers `0.1.0-alpha.1`, a private workspace package that is not published to a registry.

This is exploratory pre-production work under the draft [Core UI proposal](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/designs/core-ui/README.md), [RFC 0002](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/rfcs/0002-tech-stack.md), and [RFC 0003](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/rfcs/0003-engineering-conventions.md). Their acceptance remains pending.

## Setup

Add the package and its Radix Themes peer to the consuming workspace, then run `bun install`:

```json
{
    "dependencies": {
        "@radix-ui/themes": "^3.3.0",
        "@whiteeclipse/core-ui": "workspace:*"
    }
}
```

The consumer must also install React and React DOM versions compatible with Radix Themes. Its bundler must support package CSS imports and resolve CSS `@import` statements.

## Usage

Import the stylesheet once in the application entrypoint or Storybook preview, then use Radix Themes components directly:

```tsx
import "@whiteeclipse/core-ui/styles.css";
import { Button, Theme } from "@radix-ui/themes";

/** Renders a minimal themed control for visual review. */
export function Example() {
    return (
        <Theme appearance="light">
            <Button>Continue</Button>
        </Theme>
    );
}
```

Use Radix's `Theme` props to compare appearances, palettes, and other theme options. The stylesheet includes Radix Themes' base CSS; consumers do not need to import it separately. Load application-specific overrides after this stylesheet.

## Tailwind CSS

For Tailwind CSS v4, import both packages from one application stylesheet, with Core UI first:

```css
@import "@whiteeclipse/core-ui/styles.css";
@import "tailwindcss";
```

Import that application stylesheet once in the application entrypoint or Storybook preview instead of importing Core UI's stylesheet separately. Process it with Tailwind's Vite plugin or another supported Tailwind v4 integration.

Core UI declares the layer order `theme, base, radix, components, utilities` and places Radix Themes styles in `radix`. Tailwind's base reset stays below Radix component styles, while utility classes can override them without `!important`. Keep future shared Core UI overrides in the `radix` layer after the upstream import. Unlayered application CSS takes precedence over these layers.

Apply utility classes directly to Radix components when an application needs a local adjustment:

```tsx
<Button className="w-full">Continue</Button>
```

Tailwind is an optional consumer integration, not a dependency of Core UI. This setup targets Tailwind v4; compatibility with Tailwind v3 is not established.

## Typography

The stylesheet loads self-hosted variable fonts through Fontsource: Outfit for Radix headings and the `--brand-font-family` token, Inter for body text, and JetBrains Mono for code. Applications can use `font-family: var(--brand-font-family)` for the company name and `var(--code-font-family)` for annotations. Plain HTML headings outside Radix components need application styling to use the heading token. Font files are bundled by the consumer; no Google Fonts request is required at runtime.

Fontsource packages retain their upstream font licences. Fallback system fonts apply while web fonts load or if they cannot load. These defaults apply to Radix Theme boundaries, including portalled dialogs.

## Palette and interaction study

Use `<Theme grayColor="sand" accentColor="gray">` for the exploratory White Eclipse palette. Other neutral scales retain their upstream Radix values so Storybook can compare alternatives. The palette also applies to Radix-created theme boundaries in portals.

The starting colours come from the [previous application stylesheet](https://github.com/whiteeclipse-studio/hypatia/blob/25f35669fe3116680d11e7040f38eea9e47edd3f/packages/platform/core-ui/src/styles.css). The off-white moves from `#f6f4ef` to a warmer, yellower ivory `#f6f2e6`, with related stone surfaces adjusted to match. Charcoal `#211f26` is retained; dark appearance uses the warmer ivory for foreground text.

Buttons, select triggers, checkboxes, radio controls, and switches use corner frames that extend into full borders over 180 ms on hover or keyboard focus. Disabled controls retain muted frames without that transition. Frames and decorative dividers use `--core-ui-border-color` (light `#796d57`, dark `#9c929d` for the White Eclipse palette). Focus has an additional outline using `--core-ui-focus-color` (`--gray-11`), and reduced-motion preferences remove the frame transition. Checked indicators and switch thumbs remain supplied by Radix. Enabled switches keep the same panel-colour track and shared control-border corner frames in both states. The square thumb is hollow with a 1px secondary-text-colour border when off, and filled with the primary foreground when on. Its 4px inset leaves room for the corner frames. Thumb position and hollow versus filled treatment distinguish the state; the thumb slides and its fill and border colours transition over 140ms, with `ease-in-out` for colours. Reduced-motion preferences remove these transitions. Disabled switches retain Radix’s muted state treatment. Tabs use square labels with a contrasting fill and a 6px square marker shown only on the selected tab, without reserved marker space on unselected tabs, a quiet hover surface, and a separate focus outline. They have no corner frames. Enabled secondary buttons use transparent surfaces, standard text weight and corner dimensions, and the same text colour (`--accent-12`) and shared border colour as primary buttons. Disabled buttons remain muted; editable text fields use persistent 1px rectangular borders and focus outlines in the primary foreground, primary text, readable secondary-colour placeholders, and the base surface, while read-only and disabled fields use a muted surface. Primary (`solid`) buttons use transparent surfaces with dark or light foregrounds appropriate to the active theme and a filled 6px square before the label. Secondary (`soft`) and ghost buttons use a hollow 6px square with a 1px stroke. Outline buttons omit the marker. Disabled buttons omit the square marker.

These are exploratory visual proposals; colour contrast and interactions still require review in each consuming composition. The control-border colours maintain at least 3:1 contrast against opaque neutral surfaces 1–5 (minimum 3.17:1 light, 3.28:1 dark). Translucent fills must be composited onto their actual backgrounds before checking contrast. Custom surfaces and coloured variants need their own checks; these measurements do not establish full accessibility compliance.

## Feedback colours

With `grayColor="sand"`, Radix's feedback colours use the following base colours in both appearances:

| Role    | Radix colour                | Base colour | Source                                                                                                                                                          |
| ------- | --------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Success | `green`                     | `#879b69`   | Original warm sage companion colour                                                                                                                             |
| Error   | `red`                       | `#cd664d`   | Sampled from the [official UI red reference](https://www.platinumgames.com/official-blog/wp-content/uploads/sites/2/2017/08/color_red.png)                      |
| Warning | `amber`, `yellow`, `orange` | `#e1d8aa`   | Sampled from the [official chip-menu support-colour reference](https://www.platinumgames.com/official-blog/wp-content/uploads/sites/2/2017/08/color_plugin.png) |

Screenshot samples are visual references, not officially published colour tokens. Continue using Radix's colour props; no component wrappers are needed. Pair feedback colours with labels or other state cues.

Success and warning callouts and badges use full-strength fills with dark contrast text (`#161518`). Error callouts and badges use a deeper red fill (`#ac4b35`) with off-white text (`#f6f2e6`) and an inset outline in the sampled UI red. The text/fill pair exceeds 4.5:1 in both appearances. Invalid text-field borders use the red-orange; small inline feedback text uses separate contrast-safe shades for each appearance. Custom backgrounds and full accessibility still require review.

Review the reference layout's **Feedback & states** tab in the warm light and dark stories. Other neutral-scale presets retain the upstream feedback colours.

## Background

The shared stylesheet includes an opt-in `core-ui-background` class. Apply it to a page wrapper inside a Radix `Theme`:

```tsx
<Theme appearance="light" grayColor="sand" accentColor="gray">
    <div className="core-ui-background">Page content</div>
</Theme>
```

It draws an 8px grid, paired arcs, and diagonal strokes using the active theme's surface and foreground tokens. The decoration stays fixed to the viewport while content scrolls and ignores pointer input. The wrapper provides an isolated stacking context and a minimum height of one viewport. Its `::before` and `::after` pseudo-elements are reserved for the drawing. Use one background wrapper per page and keep opaque panels inside it for reading surfaces.

## Obsidian theme

Build the exploratory **White Eclipse Core UI** theme from the repository root:

```sh
bun install
bun run --filter @whiteeclipse/core-ui build:obsidian
```

The build requires Bun 1.4 or newer and runs TypeScript checking before bundling. Copy `manifest.json` and `theme.css` from `packages/platform/core-ui/dist/obsidian/` into `<vault>/.obsidian/themes/White Eclipse Core UI/`. In Obsidian, select **Settings → Appearance → Themes → White Eclipse Core UI**. Restart Obsidian if the theme does not appear. Choose either light or dark under **Base color scheme**. The theme manifest has its own version, currently `0.1.0`, and targets Obsidian 1.13 or newer; that minimum is a compatibility target, not a verified version matrix.

The native theme adapts the light and dark declarations from `src/palette.css` and `src/feedback.css` at build time, keeping those scales as the colour source. Obsidian-specific styles live in `src/obsidian/`; they do not import Radix or React. The build embeds Fontsource's normal and italic Inter and JetBrains Mono faces and normal Outfit faces, including their supplied language subsets and complete font licences, in the generated CSS. It needs no plugins or network access at runtime. Obsidian's user-selected fonts and text sizes retain precedence; unavailable scripts use system fallbacks.

The theme covers workspace surfaces, active tabs and navigation, fields, buttons, square switches, Markdown headings, code, tables, properties, and semantic callouts. Active tabs, files, and outline entries display a filled square. Properties retain Obsidian's inline editors and row-level focus treatment inside a padded panel; standalone fields use the continuous rectangular borders. The build reuses the shared background drawing, anchoring its 8px grid, paired arcs, and diagonal strokes to the viewport while preserving Obsidian's native scrolling and note widths. Corner frames expand on hover and focus; reduced-motion preferences remove these and switch transitions. Native task checkboxes retain Obsidian's check marks. Custom accent preferences are overridden by the neutral Core UI action and link colours. Other callout types and syntax highlighting retain Obsidian's semantic colours.

The generated folder is disposable output. Edit source files and rebuild instead of maintaining a separate vault copy. Building does not install or activate the theme, and does not modify an existing **White Eclipse** theme. Review native editing, reading, settings, keyboard focus, mobile layouts, printing, and third-party plugins before production use. Full accessibility validation and owner acceptance remain pending.

The build follows Obsidian's [theme guidelines](https://github.com/obsidianmd/obsidian-developer-docs/blob/main/en/Themes/App%20themes/Theme%20guidelines.md) and [sample theme distribution](https://github.com/obsidianmd/obsidian-sample-theme).

## Current coverage

The package exports `@whiteeclipse/core-ui/styles.css` for web consumers and builds a standalone native Obsidian theme. It provides Radix Themes styles, shared fonts, the exploratory warm palette, corner-frame interactions, and an optional geometric background. Other geometry and motion values remain under exploration. No component wrappers or component re-exports are included. The background is drawn in CSS.

No package build step is needed for web stylesheet imports; Obsidian requires the build above. CSS is marked as a side effect so consumer bundlers retain the imported styles. Visual and accessibility validation of future overrides remains pending; this baseline does not establish compliance of consuming applications.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                                                   |
| -------- | ---------- | ------------- | ----------------------------------------------------------------------------- |
| 1        | 2026-10-26 | Akane SHIMOKA | Add exploratory styles, typography, palette, feedback, frames, and background |
| 2        | 2026-10-27 | Codex         | Distinguish switch states with contrasting tracks and thumbs                  |
| 3        | 2026-10-27 | Codex         | Reduce switch thumb size with a 4px inset                                     |
| 4        | 2026-10-27 | Codex         | Strengthen active switch corner strokes                                       |
| 5        | 2026-10-27 | Codex         | Use contrasting neutral colour for active switch corners                      |
| 6        | 2026-10-27 | Codex         | Keep switch tracks stable and distinguish hollow and filled thumbs            |
| 7        | 2026-10-27 | Codex         | Animate switch thumb fill and border changes                                  |
| 8        | 2026-10-27 | Akane SHIMOKA | Correct reduced-motion switch transitions and button marker guidance          |
| 9        | 2026-10-27 | Codex         | Add the exploratory native Obsidian theme and offline build instructions      |
