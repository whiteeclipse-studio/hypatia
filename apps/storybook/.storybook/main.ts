import type { StorybookConfig } from '@storybook/react-vite';

/** Story discovery and addons for the exploratory component catalogue. */
const config: StorybookConfig = {
    framework: '@storybook/react-vite',
    stories: ['../src/components/**/*.stories.@(ts|tsx)', '../src/samples/**/*.stories.@(ts|tsx)'],
    addons: ['@storybook/addon-a11y'],
    core: { disableTelemetry: true },
};

export default config;
