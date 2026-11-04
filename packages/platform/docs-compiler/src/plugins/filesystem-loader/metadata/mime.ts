/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { basename } from "node:path";


/**
 * Resolves MIME by filename through Bun's built-in MIME database without reading disk contents.
 * Extensionless root licences retain their historical Markdown treatment.
 * This is an extension hint, not content validation or MIME sniffing.
 *
 * @param file Source filename.
 * @returns A known MIME type or application/octet-stream.
 */
export function resolveMimeType(file: string): string {
    if (/^licen[cs]e$/iu.test(basename(file))) {
        return "text/markdown";
    }
    return Bun.file(file).type;
}
