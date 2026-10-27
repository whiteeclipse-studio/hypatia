/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { DispatchWithoutAction, ReactElement } from "react";
import { Button } from "@radix-ui/themes";
import logoLight from "@whiteeclipse/core-ui/assets/white-eclipse-light.png";
import logoDark from "@whiteeclipse/core-ui/assets/white-eclipse-dark.png";

/** Current appearance and its existing preference action for the shared site header. */
interface HeaderProps {
    appearance: "light" | "dark";
    toggle: DispatchWithoutAction;
}

/**
 * Restores the old documentation site's logo, uppercase identity, and quiet tagline.
 *
 * @param props - Current light or dark appearance and preference control.
 * @returns The responsive documentation header.
 */
export function SiteHeader(props: HeaderProps): ReactElement {
    const { appearance, toggle } = props;
    const logo = appearance === "light" ? logoLight : logoDark;
    return (
        <header className="flex shrink-0 items-center justify-between gap-6 border-b border-line px-9 py-5 max-desktop:gap-3 max-desktop:px-5 max-desktop:py-4">
            <div className="flex min-w-0 flex-wrap items-center gap-3.5 max-desktop:gap-2">
                <a
                    className="flex min-w-0 items-center gap-4 no-underline max-desktop:gap-2.5"
                    href="/"
                    aria-label="White Eclipse documentation home"
                >
                    <img
                        src={logo}
                        alt=""
                        width="64"
                        height="64"
                        className="size-16 shrink-0 object-contain max-desktop:size-12"
                    />
                    <span className="whitespace-nowrap font-brand text-lg tracking-[0.08em] uppercase max-desktop:text-[13px]">
                        White Eclipse
                    </span>
                </a>
                <span className="text-(--gray-8)" aria-hidden="true">
                    /
                </span>
                <span className="text-muted max-desktop:text-xs">Documentation</span>
            </div>
            <div className="flex shrink-0 items-center gap-6 max-desktop:gap-2">
                <p className="text-xs text-muted max-contents:hidden">Engineering knowledge, in one place.</p>
                <Button
                    variant="outline"
                    size="1"
                    onClick={toggle}
                    aria-label={`Switch to ${appearance === "light" ? "dark" : "light"} appearance`}
                >
                    {appearance === "light" ? "Dark" : "Light"}
                </Button>
            </div>
        </header>
    );
}
