/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { AssetArtifact } from "./base.js";
import type { AudioArtifact } from "./audio.js";
import type { ImageArtifact } from "./image.js";
import type { VideoArtifact } from "./video.js";
import type { PdfArtifact } from "./pdf.js";


export * from "./base.js";
export * from "./audio.js";
export * from "./image.js";
export * from "./video.js";
export * from "./pdf.js";

/** Union of generic assets and the supported specialized asset artifacts. */
export type AnyAssetArtifact = AudioArtifact | ImageArtifact | VideoArtifact | PdfArtifact | AssetArtifact;
