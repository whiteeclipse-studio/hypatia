/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { Theme } from '@radix-ui/themes';
import type { ComponentProps } from 'react';

/** Radix Theme options accepted by the shared exploratory theme. */
export type CoreThemeProps = ComponentProps<typeof Theme>;

/** Provides the exploratory White Eclipse theme; import ./styles.css for its visual defaults. */
export function CoreTheme({ className, ...props }: CoreThemeProps) {
    return (
        <Theme
            accentColor="gray"
            grayColor="sand"
            radius="none"
            panelBackground="solid"
            appearance="light"
            {...props}
            className={['core-ui', className].filter(Boolean).join(' ')}
        />
    );
}
