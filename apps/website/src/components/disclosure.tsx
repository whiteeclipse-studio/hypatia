/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { ReactElement } from "react";
import { Button, Dialog } from "@radix-ui/themes";
import styles from "../styles/article.module.css";

/** A disclosure receives only HTML returned by the builder's sanitized page renderer. */
interface DisclosureProps {
    label: string;
    title: string;
    html: string;
    accessibleLabel?: string;
}

/**
 * Exposes complete notices or revision history outside the article body.
 *
 * @param props - Accessible trigger label, dialog title, and sanitized disclosure.
 * @param props.label - Trigger text.
 * @param props.title - Disclosure title.
 * @param props.html - Sanitized disclosure HTML.
 * @param props.accessibleLabel - Optional full label for a compact symbol trigger.
 * @returns A keyboard-accessible modal with focus restoration.
 */
export function Disclosure({ label, title, html, accessibleLabel }: DisclosureProps): ReactElement {
    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button variant="outline" size="1" className="shrink-0" aria-label={accessibleLabel ?? label}>
                    {label}
                </Button>
            </Dialog.Trigger>
            <Dialog.Content maxWidth="760px" aria-describedby={undefined}>
                <Dialog.Title>{title}</Dialog.Title>
                <div className={styles["article"]} dangerouslySetInnerHTML={{ __html: html }} />
                <div className="mt-(--space-5) flex justify-end">
                    <Dialog.Close>
                        <Button variant="outline">Close</Button>
                    </Dialog.Close>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
}
