/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoadingStudy } from "./loading-study";

const meta = {
    title: "Core UI/Components/Loading",
    component: LoadingStudy,
    parameters: { layout: "padded" },
} satisfies Meta<typeof LoadingStudy>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
