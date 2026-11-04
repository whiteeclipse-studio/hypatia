/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import type { AssetArtifact } from "./base.ts";
import type { AudioArtifact } from "./audio.ts";
import type { ImageArtifact } from "./image.ts";
import type { VideoArtifact } from "./video.ts";
import type { PdfArtifact } from "./pdf.ts";


export * from "./base.ts";
export * from "./audio.ts";
export * from "./image.ts";
export * from "./video.ts";
export * from "./pdf.ts";

/** Union of generic assets and the supported specialized asset artifacts. */
export type AnyAssetArtifact = AudioArtifact | ImageArtifact | VideoArtifact | PdfArtifact | AssetArtifact;
