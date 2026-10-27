/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReferenceLayout } from "./reference-layout";

const meta = {
    title: "Core UI/Layouts/Reference layout",
    component: ReferenceLayout,
    args: {
        accentColor: "gray",
        grayColor: "sand",
        radius: "none",
        scaling: "100%",
        density: "comfortable",
        composition: "sidebar",
        typography: "brand",
    },
    argTypes: {
        accentColor: {
            control: "select",
            options: ["bronze", "gold", "gray", "iris", "blue", "teal", "orange", "ruby"],
        },
        grayColor: { control: "select", options: ["sand", "gray", "mauve", "slate", "sage", "olive"] },
        radius: { control: "select", options: ["none", "small", "medium", "large", "full"] },
        scaling: { control: "select", options: ["90%", "95%", "100%", "105%", "110%"] },
        density: { control: "inline-radio", options: ["comfortable", "compact"] },
        composition: { control: "inline-radio", options: ["sidebar", "stacked"] },
        typography: { control: "inline-radio", options: ["brand", "system"] },
    },
} satisfies Meta<typeof ReferenceLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const CompactWorkspace: Story = { args: { density: "compact", scaling: "95%" } };
export const ReadingLayout: Story = { args: { composition: "stacked" } };
