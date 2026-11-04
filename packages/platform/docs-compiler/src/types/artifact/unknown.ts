/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { Artifact } from "./base.ts";


/** An input whose contents could not be interpreted. */
export interface UnknownArtifact extends Artifact {
    /** @inheritDoc */
    readonly type: "unknown";

    /** @inheritDoc */
    read(): Promise<undefined>;
}
