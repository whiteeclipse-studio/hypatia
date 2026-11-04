---
id: docs-compiler-archive-reader
parent: ./README.md
---

# Archive reader

`archiveReader(options?)` validates an archive and restores a Repository snapshot without source parsing. See
the [[../README.md|package documentation]] for coverage and [[../serialization.md|Serialization]] for the shared format.

## Usage

From the package directory:

```ts
import { compile } from "./src";
import { archiveReader } from "@whiteeclipse/docs-compiler/packages/archive-reader";

await using snapshot = await compile({
    repositories: "https://example.com/docs.tgz",
    plugins: [archiveReader()],
});
```

HTTP (S) URLs must end in `.tgz` or `.tar.gz` in the pathname; queries are allowed. Credentials and fragments are
rejected. Other protocols or filename suffixes are delegated. HTTP failures reject compilation. Fetch uses the compiler
cancellation signal; browser networking also follows browser CORS rules.

Bun/Node conditions additionally accept local archive paths and `file:` URLs. Relative paths resolve against the process
working directory during resolution. Local file URLs cannot contain queries or fragments. The browser adapter contains
no filesystem imports.

No Markdown parser, link resolver, or filesystem loader is required to read a completed archive. The plugin returns a
complete inventory from its repository `load` hook; it does not individually resolve archived child sources for later
source transforms.

## Resource bounds

| Option             | Default               | Scope                                                     |
|--------------------|-----------------------|-----------------------------------------------------------|
| `maxArchiveBytes`  | 67,108,864 (64 MiB)   | Consumed input stream bytes before decompression.         |
| `maxExpandedBytes` | 268,435,456 (256 MiB) | Complete decompressed TAR, including headers and padding. |
| `maxEntries`       | 10,000                | TAR headers, including optional layout directories.       |

Each override must be a positive safe integer. Bounds apply independently to every input archive. Input and expanded
bytes are collected within those limits; this is not constant-memory streaming extraction. Fetch can transparently
decode HTTP content encoding before the reader sees response bytes.

Cancellation also cancels pending stream consumption. The reader does not poll or impose a timeout by itself; consumers
can supply the callbacks below.

## Custom source transport and watching

`openSource(source, signal)` optionally returns a web byte stream for a resolved archive source, allowing callers to
reuse downloaded or persisted Blob contents. Existing URL and filename resolution still applies, and the standard
archive validation and resource bounds remain active.

`subscribe(source, changed, signal)` optionally registers a change listener and returns its cleanup callback, directly
or through a promise. In watch mode the reader registers this subscription through the compiler watch API. Call
`changed()` after replacement bytes are ready; it invalidates the stable repository reference, causing a rebuild through
`openSource`. The configured repository input does not change. One-shot compilation does not start subscriptions.

A browser worker can call `compile({ watch: true, ... })` once and retain that session for successive archive
replacements. Failed rebuilds retain the previous snapshot. A failed initial invocation still requires a fresh worker
before another `compile()` call. TTL policy, HTTP validation, durable storage, update coordination and timeout handling
remain consumer responsibilities.

## Validation

The reader uses web `DecompressionStream("gzip")`, then validates conventional TAR headers, checksums, entry framing,
end blocks, and layout. Only regular files and optional empty `artifacts/` and `payloads/` directory entries are
supported. Symlinks, hardlinks, PAX/GNU extension headers, binary numeric encodings, escaping paths, duplicate entries,
invalid UTF-8 names, and nonzero trailing data are rejected. This intentionally accepts the fixed writer layout rather
than general-purpose TAR archives.

Before caching content it checks JSON UTF-8 decoding, manifest version and schema, UUIDv7 keys, artifact schemas,
normalized logical paths, record/inventory path agreement, referenced record and asset existence, byte lengths, and
Blob-compatible MIME strings. Files outside the manifest's referenced inventory are rejected. Unsupported format
versions fail rather than being upgraded silently.

## Restored content

Repository identity, metadata, and inventory come from the manifest. Document and translation HAST becomes
compiler-cache content; assets become Blobs with the stored MIME type; unknown reads return `undefined`. Cache keys are
freshly generated and independent of archive keys.

Metadata is copied and deeply frozen. Reads return independent values and never refetch a newer archive to satisfy an
old snapshot. Missing cached payloads fail. Snapshot disposal and invalidation
follow [[../repository.md|Repository and Snapshot]].

Validation checks structure and payload consistency, not provenance, signatures, content authenticity, or rendering
safety. Binary formats are not sniffed or sanitized, and HAST is not made safe for HTML rendering. Consumers retain
responsibility for publication security.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                                               |
|----------|------------|---------------|---------------------------------------------------------------------------|
| 1        | 2026-11-04 | Akane SHIMOKA | Document archive input, watch callbacks, validation, bounds, and lifetime |
