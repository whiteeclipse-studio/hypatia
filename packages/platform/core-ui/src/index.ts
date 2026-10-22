/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/** Shared exploratory theme and its configuration contract. */
export { CoreTheme, type CoreThemeProps } from './theme';

/** Styled Radix components and types available to the exploratory catalogue. */
export * from '@radix-ui/themes';

/** Radix Primitives for interactions that do not have a Themes counterpart. */
export * as Primitives from 'radix-ui';

/** Existing direct toggle export retained for the button studies. */
export { Root as Toggle } from '@radix-ui/react-toggle';
