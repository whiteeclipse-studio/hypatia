/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import process from "node:process";
import type { DocumentationSource } from "@whiteeclipse/documentation-builder/vite";

/** Local sources are used only by development; production always reads an artifact. */
export const sources: DocumentationSource[] = [
    {
        local: { repositoryRoot: "../.." },
        artifact: process.env["DOCUMENTATION_ARTIFACT"] ?? "./artifacts/hypatia.tar.gz",
    },
];
