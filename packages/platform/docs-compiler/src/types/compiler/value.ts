/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { AnyArtifact } from "../artifact";
import type { Repository } from "../repository";


/** An initial or transformed source representation. */
export type CompilationResult = AnyArtifact | Repository;
