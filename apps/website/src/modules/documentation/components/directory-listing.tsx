/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import type { ReactElement } from "react";
import { Link } from "react-router";
import { useTranslation } from "@whiteeclipse/i18next";
import { directoryChildren } from "../domain/directory-children";
import type { ProjectIndex } from "../domain/types";


export function DirectoryListing({
    index,
    route,
    locale,
}: {
    index: ProjectIndex;
    route: string;
    locale: string;
}): ReactElement {
    const { t } = useTranslation("website");
    const children = directoryChildren(index, route, locale).map(child => (
        <li key={child.route}>
            <Link to={child.route}>{child.title}</Link>
        </li>
    ));
    return (
        <>
            <p className="text-sm text-(--gray-11)">{t("generatedDirectory")}</p>
            <ul className="grid list-none gap-4 py-6 [&_a]:text-(--gray-12) [&_a]:underline [&_a]:underline-offset-4">
                {children}
            </ul>
        </>
    );
}
