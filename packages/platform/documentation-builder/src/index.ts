/* Copyright © 2026 White Eclipse. Released under the MIT License. */
export { buildDocumentation } from "./build/index.ts";
export { writeArtifact, type WriteOptions } from "./build/write.ts";
export { DocumentationError } from "./errors.ts";
export type {
    BuildDiagnostic,
    BuildOptions,
    BuildResult,
    DocumentationArtifact,
    DocumentationManifest,
    DocumentationPlugin,
    GeneratedPageMetadata,
    ProcessingLimits,
    RepositorySource,
    SourceFile,
    TransformationContext,
} from "./types.ts";
