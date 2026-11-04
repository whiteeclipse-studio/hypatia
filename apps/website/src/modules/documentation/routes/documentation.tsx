/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ReactElement } from "react";
/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { Link, Navigate, useLocation } from "react-router";
import { Heading } from "@radix-ui/themes";
import { useTranslation } from "@whiteeclipse/i18next";
import { useDocumentation } from "../store/use-documentation";
import { documentationHome, normalizedRoute, projectHome } from "../domain/routes";
import { Reader } from "../layouts/reader";


/**
 * Selects the project reader or project directory from the current URL.
 *
 * @returns The prepared result.
 */
export function DocumentationRoutes(): ReactElement {
    const { state } = useDocumentation();
    const { pathname } = useLocation();
    const { t } = useTranslation("website");
    let route: string;
    try {
        route = normalizedRoute(pathname);
    } catch {
        return <main id="documentation-content">{t("notFound")}</main>;
    }
    if (route === "/") {
        return <Navigate to={documentationHome} replace />;
    }
    const index = state.indexes.find(item => route.startsWith(`/${item.project.id}/`));
    if (index !== undefined) {
        return <Reader index={index} route={route} />;
    }
    const projects = state.indexes.map(item => (
        <li key={item.project.id}>
            <Link to={projectHome(item.project.id)}>{item.project.name}</Link>
        </li>
    ));
    return (
        <main
            id="documentation-content"
            className="mx-auto w-full max-w-225 flex-1 overflow-auto px-8 py-16"
            tabIndex={-1}
        >
            <Heading size="8">{route === "/" ? t("documentation") : t("notFound")}</Heading>
            <ul className="grid list-none gap-4 py-6 [&_a]:text-(--gray-12) [&_a]:underline [&_a]:underline-offset-4">
                {projects}
            </ul>
        </main>
    );
}
