# White Eclipse

A small Obsidian theme based on White Eclipse's Cydonia moodboard: parchment,
charcoal ink, instrument markings, flat controls, and muted mineral annotations.
Dark mode uses warm olive charcoal with pale paper text.

## Use

This folder is already in the Hypatia vault's theme directory. Open
**Settings → Appearance → Themes** and select **White Eclipse**. If it is missing,
restart Obsidian. Choose **Light** or **Dark** under **Base color scheme**.

For another vault, copy this folder to `<vault>/.obsidian/themes/White Eclipse/`.
Only `manifest.json` and `theme.css` are needed at runtime. Requires Obsidian
1.13 or newer; no plugins, build step, or network requests.

## Design

- Light: paper `#e9e4d5`, ink `#434137`, mineral green `#425d51`,
  stone sidebars `#d3cbb7`.
- Dark: charcoal `#252823`, paper `#e6e2d5`, mineral green `#a2bfae`.
- Inter for notes and interface; IBM Plex Mono for code and small annotations.
  Installed fonts are used, with system fallbacks. Fonts are not bundled.
- Your font choices and text size in Appearance take precedence. This vault's
  JetBrains Mono preference therefore stays in effect.
- Widely tracked uppercase titles, double title rules, banded second-level
  headings, and monospaced lower-level headings.
- Inverted tabs and active file rows, square selection marks, uppercase folder
  labels, and stronger panel dividers.
- Original CSS grid, fine orbital arcs, and registration rails around notes.
  Rails are omitted on mobile and windows narrower than 700px. Print omits
  patterns and rails.
- Banded callouts preserve semantic colours; framed code blocks, inverted table
  headers, and bordered properties continue the same document language.
- Underlined mineral links and near-square controls; no decorative panel shadows.
- The theme defines its own action and link colours, including when Appearance
  has a saved custom accent. Edit the colour variables to change that palette.
- Obsidian's layout, note widths, keyboard focus indicators, and built-in motion
  behaviour remain available. There are no added animations.

Version 0.2 takes visual inspiration from the locally installed **Nier 0.1.18**
theme by **exloseur3d**, especially its parchment, tracked headings, borders, and
patterned surfaces. White Eclipse's patterns and decorative rules are original CSS;
the reference theme's embedded images and custom icons are not included.

## Edit

Edit `theme.css` here; Obsidian reloads theme CSS while it is selected. Shared
typography and geometry live under `body`; palettes live under `.theme-light`
and `.theme-dark`. The last few rules add the heading and selection details.
Set `--white-eclipse-grid` and `--white-eclipse-orbit` to `transparent` in either palette to
remove its background pattern while keeping the document frame.

Version 0.3.1 restores the original light and dark palettes while retaining the
White Eclipse name. The original palette and layout were visually checked in
desktop Obsidian 1.14.4 with Live Preview in both modes and Reading view in
light mode. Original palette checks cover body, sidebar, section bands, muted
and faint text, links, selection, and highlights at a minimum 4.5:1 text contrast.
Third-party plugin interfaces, mobile layouts, and printed output have not
been visually verified.

Implementation follows Obsidian's [theme guidelines](https://docs.obsidian.md/Themes/App+themes/Theme+guidelines).

## Copyright and licence

Copyright © 2026 White Eclipse. Released under the MIT License; see the
project's root [LICENCE](../../../LICENCE).
