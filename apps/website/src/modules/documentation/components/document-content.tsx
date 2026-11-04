/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { type ComponentProps, Fragment, type ReactElement } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { unified } from "unified";
import rehypeReact from "rehype-react";
import { Link } from "react-router";
import type { Root } from "hast";
import type { ProjectIndex } from "../domain/types";
import { destination } from "../domain/routes";
import { safeTree } from "../../../rendering/sanitize";


/**
 * Unified's HAST-to-JSX compiler renders sanitized trees without HTML injection.
 *
 * @param props Rendering inputs.
 * @returns The prepared result.
 * @param props.tree The tree input.
 * @param props.index The index input.
 * @param props.locale The locale input.
 */
export function DocumentContent({
    tree,
    index,
    locale,
}: {
    tree: Root;
    index: ProjectIndex;
    locale: string;
}): ReactElement {
    /**
     * Maps compiler links to application navigation or validated external links.
     *
     * @param props Rendering inputs.
     * @returns The prepared result.
     * @param props.href The href input.
     * @param props.children The children input.
     */
    function Anchor({ href, children, ...props }: ComponentProps<"a">) {
        const url = destination(index, href ?? "", locale);
        if (url === undefined) {
            return <span>{children}</span>;
        }
        if (url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/_assets/")) {
            return (
                <Link {...props} to={url}>
                    {children}
                </Link>
            );
        }
        return (
            <a {...props} href={url} rel="noopener noreferrer">
                {children}
            </a>
        );
    }
    /**
     * Embeds repository assets or HTTP(S) images, preserving alternative text.
     *
     * @param props Rendering inputs.
     * @returns The prepared result.
     * @param props.src The src input.
     * @param props.alt The alt input.
     */
    function Image({ src, alt, ...props }: ComponentProps<"img">) {
        const value = typeof src === "string" ? src : "";
        const external = /^https?:\/\//i.test(value) && URL.canParse(value) ? value : undefined;
        const url = index.assets[value] ?? external;
        if (url === undefined) {
            return <span className="text-(--gray-11) italic">{alt ?? value}</span>;
        }
        return <img {...props} src={url} alt={alt ?? ""} loading="lazy" referrerPolicy="no-referrer" />;
    }
    const processor = unified().use(rehypeReact, { Fragment, jsx, jsxs, components: { a: Anchor, img: Image } });
    return processor.stringify(safeTree(tree));
}
