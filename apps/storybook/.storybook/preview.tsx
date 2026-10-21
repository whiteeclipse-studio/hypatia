import type { Preview } from '@storybook/react-vite';
import { CoreTheme } from '@whiteeclipse/core-ui';
// Load shared defaults before the local design experiments.
import '@whiteeclipse/core-ui/styles.css';
import '../src/preview.css';
import '../src/catalogue.css';

/** Shared appearance controls and theme decoration for all component studies. */
const preview: Preview = {
    globalTypes: {
        theme: {
            description: 'Core UI appearance',
            toolbar: {
                icon: 'circlehollow',
                items: ['light', 'dark'],
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: { theme: 'light' },
    decorators: [
        (Story, context) => (
            <CoreTheme appearance={context.globals.theme === 'dark' ? 'dark' : 'light'}>
                <Story />
            </CoreTheme>
        ),
    ],
    parameters: {
        layout: 'fullscreen',
        controls: { expanded: true },
    },
};

export default preview;
