/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { RepositoryConfiguration } from "./types";

/** Exploratory source registry under draft RFC-0002; hooks must be imported from application-owned code. */
export const repositories: readonly RepositoryConfiguration[] = [
    { name: "ryugu", title: "Ryugu", url: "https://github.com/whiteeclipse-studio/ryugu.git" },
];
