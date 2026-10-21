import type { PropsWithChildren } from 'react';

/** Places candidates in a responsive comparison without changing their behaviour. */
export function StudyFrame({ children }: PropsWithChildren) {
    return <main className="study-frame">{children}</main>;
}

/** Names a candidate while keeping its local styling separate from the shared theme. */
export function Candidate({ title, children }: PropsWithChildren<{ title: string }>) {
    return (
        <section className="study-candidate" aria-label={title}>
            <h2 className="study-title">{title}</h2>
            {children}
        </section>
    );
}

/** Original decorative arrow for utility and composition examples. */
export function ArrowIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
            focusable="false"
        >
            <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
    );
}
