/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { BuildDiagnostic, DocumentationArtifact, ProcessingLimits } from "../types.ts";
import type { PipelineInput } from "../source/pipeline.ts";
import type { RenderInput, RenderedPage } from "../artifact/render-content.ts";

/** Internal structured-clone messages; trusted repository plugins are never serialized. */
export type WorkerRequest =
    | { kind: "build"; input: PipelineInput; limits: ProcessingLimits }
    | { kind: "load"; bytes: Uint8Array; limits: ProcessingLimits }
    | { kind: "validate"; files: Map<string, Uint8Array>; limits: ProcessingLimits }
    | { kind: "render"; input: RenderInput; limits: ProcessingLimits }
    | { kind: "pack"; artifact: DocumentationArtifact; limits: ProcessingLimits };

/** A completed processing result, or a serialized error preserving its category. */
export type WorkerReply =
    | { kind: "artifact"; artifact: DocumentationArtifact; diagnostics: BuildDiagnostic[] }
    | { kind: "archive"; bytes: Uint8Array }
    | { kind: "rendered"; page: RenderedPage }
    | { kind: "error"; code: string; message: string };
