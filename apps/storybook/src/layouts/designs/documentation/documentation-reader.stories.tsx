/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useGlobals } from "storybook/preview-api";
import { DocumentationReader } from "./documentation-reader";

const meta = {
    title: "Designs/Documentation/Reader",
    component: DocumentationReader,
    args: { initialPage: "getting-started" },
    parameters: { layout: "fullscreen", controls: { disable: true } },
    /**
     * Connects reader language actions to the shared Storybook globals.
     *
     * @param args - The selected sample document and story arguments.
     * @returns The reader with synchronized language controls.
     */
    render: function ReaderStory(args) {
        const [, updateGlobals] = useGlobals();
        /**
         * Keeps the bottom bar and manager locale toolbar synchronized.
         *
         * @param locale - The language selected in the reader.
         */
        function changeLocale(locale: string): void {
            updateGlobals({ locale });
        }
        return <DocumentationReader {...args} onLocaleChange={changeLocale} />;
    },
} satisfies Meta<typeof DocumentationReader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Overview: Story = { args: { initialPage: "overview" } };
export const Desktop: Story = { globals: { viewport: { value: "desktop", isRotated: false } } };
export const Tablet: Story = { globals: { viewport: { value: "tablet", isRotated: false } } };
export const Mobile: Story = { globals: { viewport: { value: "mobile1", isRotated: false } } };
export const Dark: Story = { globals: { appearance: "dark", viewport: { value: "desktop", isRotated: false } } };
