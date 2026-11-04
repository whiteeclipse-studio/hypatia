/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import type { ReactElement } from "react";
import { useLocation } from "react-router";
import { ReloadIcon } from "@radix-ui/react-icons";
import { IconButton, Tooltip } from "@radix-ui/themes";
import { useTranslation } from "@whiteeclipse/i18next";
import { useDocumentation } from "../store/use-documentation";


/**
 * Updates the active project's documentation from the site header.
 *
 * @returns The accessible refresh control, or no action outside a project.
 */
export function UpdateDocumentation(): ReactElement | null {
    const { pathname } = useLocation();
    const { state, store } = useDocumentation();
    const { t } = useTranslation("website");
    const index = state.indexes.find(item => `${pathname}/`.startsWith(`/${item.project.id}/`));
    if (index === undefined) {
        return null;
    }
    return (
        <Tooltip content={t("update")}>
            <IconButton
                size="2"
                variant="ghost"
                aria-label={t("update")}
                disabled={index.project.archiveUrl === undefined && !import.meta.env.DEV}
                loading={state.updating[index.project.id] ?? false}
                onClick={() => {
                    store.update(index);
                }}
            >
                <ReloadIcon width="16" height="16" aria-hidden="true" />
            </IconButton>
        </Tooltip>
    );
}
