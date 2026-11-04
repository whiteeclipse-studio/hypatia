/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { type ReactElement, useMemo } from "react";
import { Link } from "react-router";
import { useTranslation } from "@whiteeclipse/i18next";
import { type Breadcrumb, breadcrumbs } from "../domain/breadcrumbs";
import type { ProjectIndex } from "../domain/types";


/** Displays the full documentation path with navigable ancestors. */
export function Breadcrumbs(props: BreadcrumbsProps): ReactElement {
    const { t, i18n } = useTranslation("website");
    const items = breadcrumbs(props.index, props.route, i18n.language, props.title).map((item, position) => (
        <BreadcrumbItem key={item.route} item={item} position={position} route={props.route} />
    ));

    return (
        <nav aria-label={t("breadcrumb")} className="min-w-0">
            <ol className="m-0 flex list-none flex-wrap items-center gap-x-3 gap-y-1 p-0">{items}</ol>
        </nav>
    );
}

/** Props passed down to the {@link Breadcrumbs} component. */
export interface BreadcrumbsProps {
    /** The project's navigation inventory. */
    readonly index: ProjectIndex;
    /** The normalized current route. */
    readonly route: string;
    /** The selected document locale. */
    readonly locale: string;
    /** The document title. */
    readonly title: string | undefined;
}

/** Displays a single breadcrumb in the list. */
function BreadcrumbItem(props: BreadcrumbItemProps): ReactElement {
    const prefixSlash = useMemo(() => {
        if (props.position <= 0) {
            return null;
        }

        return (
            <span aria-hidden="true" className="text-(--gray-9)">
                /
            </span>
        );
    }, [props.position]);

    const title = useMemo(() => {
        if (props.item.route === props.route) {
            return (
                <span aria-current="page" className="wrap-anywhere">
                    {props.item.title}
                </span>
            );
        }

        return (
            <Link to={props.item.route} className="wrap-anywhere underline-offset-4 hover:underline">
                {props.item.title}
            </Link>
        );
    }, [props.item.route, props.route, props.item.title]);

    return (
        <li className="flex min-w-0 items-center gap-3">
            {prefixSlash}
            {title}
        </li>
    );
}

/** Props passed down to the BreadcrumbItem component. */
interface BreadcrumbItemProps {
    /** The breadcrumb item being rendered. */
    readonly item: Breadcrumb;
    /** The position of the item in the breadcrumbs. */
    readonly position: number;
    /** The current document route. */
    readonly route: string;
}
