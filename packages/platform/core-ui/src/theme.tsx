/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { type ReactElement, type ReactNode, useEffect, useState } from "react";
import { Theme as RadixTheme } from "@radix-ui/themes";


/**
 * Applies Core UI themes while preserving the initial hydration appearance.
 *
 * @param props Rendering inputs.
 * @param props.children The application subtree.
 * @returns A themed application subtree.
 */
export function Theme({ children }: { children: ReactNode }): ReactElement {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        const query = matchMedia("(prefers-color-scheme: dark)");

        /** Synchronises appearance with the system preference. */
        const update = () => {
            setDark(query.matches);
        };
        update();

        query.addEventListener("change", update);
        return () => {
            query.removeEventListener("change", update);
        };
    }, []);

    return (
        <RadixTheme appearance={dark ? "dark" : "light"} grayColor="sand" accentColor="gray" radius="none">
            {children}
        </RadixTheme>
    );
}
