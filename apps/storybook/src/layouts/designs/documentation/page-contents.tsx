/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { ReactElement } from "react";
import { Link, Text } from "@radix-ui/themes";
import { useTranslation } from "@whiteeclipse/i18next";
import { sections, type PageId } from "./fixtures";

/** Current document used to derive section links. */
interface ContentsProps {
    page: PageId;
    activeSection: string;
}

/**
 * Renders stable in-document anchors for both the rail and the narrow disclosure.
 *
 * @param props - The currently selected document.
 * @returns Its accessible page-contents navigation.
 */
export function PageContents(props: ContentsProps): ReactElement {
    const { t } = useTranslation("documentation");
    /**
     * Marks the current section for assistive technology.
     *
     * @param id - The section anchor identifier.
     * @returns The location marker when selected.
     */
    function currentSection(id: string): "location" | undefined {
        if (props.activeSection === id) {
            return "location";
        }
        return undefined;
    }
    /**
     * Presents a section link for the current sample page.
     *
     * @param section - One of the article's stable section identifiers.
     * @returns The translated section link.
     */
    function item(section: (typeof sections)[number]): ReactElement {
        return (
            <Link
                key={section}
                href={`#document-${section}`}
                aria-current={currentSection(`document-${section}`)}
                color="gray"
                underline="hover"
                className="-ml-3 block border-l-2 border-transparent px-3 py-2 text-xs leading-relaxed aria-[current=location]:border-(--gray-11) aria-[current=location]:bg-(--gray-3) aria-[current=location]:font-medium aria-[current=location]:text-(--gray-12)"
            >
                {t(`sections.${section}`)}
            </Link>
        );
    }
    let links: ReactElement | ReactElement[] = sections.map(item);
    if (props.page === "overview" || props.page === "guides") {
        links = (
            <Link
                href="#document-directory"
                color="gray"
                aria-current={currentSection("document-directory")}
                className="-ml-3 block border-l-2 border-transparent px-3 py-2 text-xs aria-[current=location]:border-(--gray-11) aria-[current=location]:bg-(--gray-3) aria-[current=location]:font-medium aria-[current=location]:text-(--gray-12)"
            >
                {t("common.explore")}
            </Link>
        );
    }
    return (
        <nav aria-label={t("common.contents")}>
            <Text as="p" size="1" color="gray" className="mb-4! uppercase tracking-widest">
                {t("common.contents")}
            </Text>
            {links}
        </nav>
    );
}
