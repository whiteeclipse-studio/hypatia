/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import { LocaleStudy } from "./locale-study";

const meta = {
    title: "Platform/Internationalization/Locale selection",
    component: LocaleStudy,
    parameters: { layout: "padded" },
} satisfies Meta<typeof LocaleStudy>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
