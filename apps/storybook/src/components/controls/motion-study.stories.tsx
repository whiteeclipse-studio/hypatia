/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionStudy } from "./motion-study";

const meta = {
    title: "Core UI/Components/Motion",
    component: MotionStudy,
    parameters: { layout: "padded" },
} satisfies Meta<typeof MotionStudy>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
