/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import { ComponentBench } from "./component-bench";

const meta = {
    title: "Core UI/Components/Controls",
    component: ComponentBench,
    parameters: { layout: "padded" },
} satisfies Meta<typeof ComponentBench>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
