/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { PDFArray, PDFDict, PDFDocument, PDFRawStream, type PDFObject } from "pdf-lib";
import { requireCondition } from "../errors.ts";

const forbiddenKeys = new Set([
    "JavaScript",
    "JS",
    "AA",
    "OpenAction",
    "Launch",
    "RichMedia",
    "EmbeddedFile",
    "EmbeddedFiles",
    "Filespec",
    "XFA",
    "AcroForm",
    "SubmitForm",
    "ImportData",
    "GoToR",
    "GoToE",
    "Sound",
    "Movie",
    "Rendition",
]);
const maxObjects = 100_000;
const headerLength = 8;
const trailerLength = 1024;

/**
 * Parses a passive PDF and rejects active features instead of embedding a PDF viewer.
 *
 * @param bytes - Untrusted PDF file.
 * @returns Completion after structural and active-content checks.
 * @rejects For malformed, encrypted, excessively complex, or active PDFs.
 */
export async function validatePdf(bytes: Uint8Array): Promise<void> {
    const decoder = new TextDecoder();
    requireCondition(
        decoder.decode(bytes.subarray(0, headerLength)).startsWith("%PDF-"),
        "Invalid PDF header",
        "unsafe-asset",
    );
    requireCondition(
        decoder.decode(bytes.subarray(-trailerLength)).includes("%%EOF"),
        "Incomplete PDF",
        "unsafe-asset",
    );
    const document = await PDFDocument.load(bytes, { updateMetadata: false, throwOnInvalidObject: true });
    requireCondition(!document.isEncrypted, "Encrypted PDFs are unsupported", "unsafe-asset");
    const pending = document.context.enumerateIndirectObjects().map(function objectValue(entry): PDFObject {
        return entry[1];
    });
    inspectObjects(pending);
}

/**
 * Iteratively examines all dictionaries, including object streams, without recursive expansion.
 *
 * @param pending - Parsed indirect objects.
 * @throws {DocumentationError} For active dictionaries or excessive object counts.
 */
function inspectObjects(pending: PDFObject[]): void {
    const visited = new Set<PDFObject>();
    while (pending.length > 0) {
        const object = pending.pop();
        if (object === undefined || visited.has(object)) {
            continue;
        }
        visited.add(object);
        requireCondition(visited.size <= maxObjects, "PDF object limit exceeded", "limits");
        inspectObject(object, pending);
    }
}

/**
 * Visits a dictionary or array and rejects action selectors as well as active keys.
 *
 * @param object - A parsed PDF object.
 * @param pending - Children awaiting inspection.
 * @throws {DocumentationError} For active PDF content.
 */
function inspectObject(object: PDFObject, pending: PDFObject[]): void {
    if (object instanceof PDFRawStream) {
        pending.push(object.dict);
    } else if (object instanceof PDFArray) {
        pending.push(...object.asArray());
    } else if (object instanceof PDFDict) {
        for (const [name, value] of object.entries()) {
            requireCondition(
                !forbiddenKeys.has(name.decodeText()),
                "PDF contains active or embedded content",
                "unsafe-asset",
            );
            requireCondition(
                !forbiddenKeys.has(value.toString().replace(/^\//u, "")),
                "PDF contains an active action",
                "unsafe-asset",
            );
            pending.push(value);
        }
    }
}
