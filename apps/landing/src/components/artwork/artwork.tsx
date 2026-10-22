/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { ReactElement } from "react";
import styles from "./artwork.module.css";

/** Source and local layout class for decorative mockup artwork. */
interface ArtworkProps {
    source: string;
    className?: string | undefined;
}

/**
 * Places an existing decorative illustration within its reserved layout footprint.
 *
 * @param props - Illustration URL and optional placement class.
 * @param props.source - Public URL of the illustration.
 * @param props.className - Placement class supplied by the enclosing layout.
 * @returns The decorative image.
 */
export function Artwork({ source, className = "" }: ArtworkProps): ReactElement {
    return <img src={source} alt="" className={`${styles["artwork"]} ${className}`} />;
}
