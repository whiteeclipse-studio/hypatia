/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TeamWorkspace } from "./team-workspace";

const meta = {
    title: "Designs/CoreUI/Team workspace",
    component: TeamWorkspace,
    parameters: { layout: "fullscreen", controls: { disable: true } },
} satisfies Meta<typeof TeamWorkspace>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Desktop: Story = { globals: { viewport: { value: "desktop", isRotated: false } } };
export const Tablet: Story = { globals: { viewport: { value: "tablet", isRotated: false } } };
export const Mobile: Story = { globals: { viewport: { value: "mobile1", isRotated: false } } };
export const Dark: Story = { globals: { appearance: "dark", viewport: { value: "desktop", isRotated: false } } };
