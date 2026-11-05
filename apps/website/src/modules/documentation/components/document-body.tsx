/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import type { ReactElement, ReactNode } from "react";


const typography = [
    "text-base leading-[1.9] [overflow-wrap:anywhere]",
    "[&_:is(h1,h2,h3,h4,h5,h6)]:font-(family-name:--heading-font-family)",
    "[&_:is(h1,h2,h3,h4,h5,h6)]:leading-[1.3] [&_:is(h1,h2,h3,h4,h5,h6)]:mt-8 [&_:is(h1,h2,h3,h4,h5,h6)]:mb-4 [&_:is(h1,h2,h3,h4,h5,h6)]:scroll-mt-24",
    "[&_h1]:text-[2rem] [&_h2]:text-[1.6rem] [&_h3]:text-xl",
    "[&_:is(p,ul,ol)]:my-4 [&_ul]:list-disc [&_ol]:list-decimal [&_:is(ul,ol)]:pl-6",
    "[&_a]:text-(--gray-12) [&_a]:underline [&_a]:underline-offset-4",
    "[&_code]:font-(family-name:--code-font-family) [&_code]:bg-(--gray-3) [&_code]:px-1 [&_code]:py-[0.1rem] [&_code]:text-[0.875em]",
    "[&_pre]:overflow-x-auto [&_pre]:bg-(--gray-3) [&_pre]:p-5 [&_pre_code]:p-0",
    "[&_:is(blockquote,.callout)]:my-6 [&_:is(blockquote,.callout)]:border-l-3 [&_:is(blockquote,.callout)]:border-(--gray-8) [&_:is(blockquote,.callout)]:bg-(--gray-2) [&_:is(blockquote,.callout)]:px-5 [&_:is(blockquote,.callout)]:py-2",
    "[&_table]:border-collapse [&_table]:text-sm",
    "[&_:is(td,th)]:border [&_:is(td,th)]:border-(--gray-6) [&_:is(td,th)]:px-3 [&_:is(td,th)]:py-2",
    "[&_img]:h-auto [&_img]:max-w-full",
].join(" ");

/**
 * Applies reader typography to sanitized HAST output with Tailwind utilities.
 *
 * @param props Rendered document contents.
 * @param props.children The HAST-to-JSX result.
 * @returns The styled article body.
 */
export function DocumentBody({ children }: { children: ReactNode }): ReactElement {
    return <div className={typography}>{children}</div>;
}
