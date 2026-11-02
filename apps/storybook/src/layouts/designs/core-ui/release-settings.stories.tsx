/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReleaseSettings } from "./release-settings";

const meta = {
    title: "Designs/CoreUI/Release settings",
    component: ReleaseSettings,
    parameters: { layout: "fullscreen", controls: { disable: true } },
} satisfies Meta<typeof ReleaseSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Desktop: Story = { globals: { viewport: { value: "desktop", isRotated: false } } };
export const Tablet: Story = { globals: { viewport: { value: "tablet", isRotated: false } } };
export const Mobile: Story = { globals: { viewport: { value: "mobile1", isRotated: false } } };
export const Dark: Story = { globals: { appearance: "dark", viewport: { value: "desktop", isRotated: false } } };
