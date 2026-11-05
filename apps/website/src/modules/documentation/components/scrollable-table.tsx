/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import type { ComponentProps, ReactElement } from "react";
import { useTranslation } from "@whiteeclipse/i18next";


/**
 * Keeps authored table columns at their natural width inside a keyboard-scrollable region.
 *
 * @param props Sanitized table attributes and contents.
 * @param props.className Additional classes supplied by the sanitized document.
 * @returns The semantic table and its horizontal scroll container.
 */
export function ScrollableTable({ className, ...props }: ComponentProps<"table">): ReactElement {
    const { t } = useTranslation("website");
    return (
        <div
            role="region"
            aria-label={t("table")}
            tabIndex={0}
            className="my-4 max-w-full overflow-x-auto overscroll-x-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--gray-11)"
        >
            <table
                {...props}
                className={`w-max min-w-full [overflow-wrap:normal] [&_:is(td,th)]:max-w-96 ${className ?? ""}`}
            />
        </div>
    );
}
