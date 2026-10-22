/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@whiteeclipse/core-ui";
import type { NavigationEntry } from "./navigation";
import styles from "./documentation-navigation.module.css";

/** Source entries at one level of the directory hierarchy. */
interface NavigationTreeProps {
    entries: readonly NavigationEntry[];
}

/** One page link or collapsible directory. */
interface NavigationItemProps {
    entry: NavigationEntry;
}

/**
 * Renders a page link or a native directory disclosure.
 *
 * @param props - Entry to display.
 * @param props.entry - Page or directory, including its active or expanded state.
 * @returns A list item with a link or nested directory.
 */
function NavigationItem({ entry }: NavigationItemProps): ReactElement {
    if (entry.kind === "page") {
        return (
            <li>
                <Link href={entry.href} aria-current={entry.current === true ? "page" : undefined}>
                    {entry.label}
                </Link>
            </li>
        );
    }

    return (
        <li>
            <details open={entry.expanded}>
                <summary>{entry.label}</summary>
                <NavigationTree entries={entry.entries} />
            </details>
        </li>
    );
}

/**
 * Preserves directory nesting and shows an honest empty state for unloaded content.
 *
 * @param props - Entries at the current directory level.
 * @param props.entries - Pages and directories in their display order.
 * @returns The nested list, or an empty-directory message.
 */
export function NavigationTree({ entries }: NavigationTreeProps): ReactElement {
    const { t } = useTranslation("interface");
    if (entries.length === 0) {
        return <p className={styles["empty"]}>{t("navigation.empty")}</p>;
    }
    const items = entries.map(entry => (
        <NavigationItem key={entry.kind === "page" ? entry.href : entry.label} entry={entry} />
    ));
    return <ul className={styles["tree"]}>{items}</ul>;
}
