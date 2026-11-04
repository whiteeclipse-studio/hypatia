---
id: docs-compiler-archive-writer
parent: ./README.md
---

# Archive writer

`archiveWriter(options?)` writes completed repositories as gzip-compressed TAR archives. See
the [[../README.md|package documentation]] for coverage and [[../serialization.md|Serialization]] for the stored format.

## Usage

```ts
import { archiveWriter } from "@whiteeclipse/docs-compiler/packages/archive-writer";

const writer = archiveWriter({ outputDirectory: "./dist/docs" });
```

This Bun-only export uses native `Archive.write` and adds no compression dependency. Add it to a one-shot compiler
pipeline after choosing source and transformation plugins. Its `closeBundle` hook runs after `buildEnd`. Watch mode
skips that hook and produces no archives through this plugin.

`outputDirectory` defaults to `./dist/docs`, resolved against the current working directory at plugin construction.
Empty directory strings are rejected; output directories are created as needed.

## Filenames and publication

Current filenames are `<repository.name.toLowerCase()>.tgz`. The resulting basename cannot be empty, `.` or `..`,
contain path separators, or contain NUL. Repository ID is stored in the manifest independently of this filename.

The writer processes repositories sequentially. It does not reject duplicate output basenames across repositories; a
later archive can replace an earlier one with the same lowercased name. Give repositories distinct names or separate
output locations when writing multiple inputs.

Each archive is compressed in a private temporary directory inside the output directory and atomically renamed into
place. Encoding, compression, or cancellation before rename preserves an existing destination. Temporary staging is
cleaned up on success or failure. Atomicity is per archive, not a transaction across all repositories.

## Encoding

The encoder collects one repository's entries before compression, generating fresh UUIDv7 artifact and asset payload
keys. Documents and translations include article HAST inline; assets reference binary entries; unknown artifacts contain
metadata only. Logical paths, inventory-key agreement, metadata, and stored schemas are validated. Asset read results
must be Blobs matching declared MIME type and byte size.

JSON uses ordinary `JSON.stringify` serialization followed by schema validation of the input records. Do not supply
custom serializers or non-JSON extension values; the writer is not a general lossless serializer for arbitrary runtime
metadata. Memory use scales with collected repository contents. No deterministic byte-for-byte output, streaming
encoding, encryption, or authenticity guarantee is provided.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                         |
|----------|------------|---------------|-------------------------------------|
| 1        | 2026-11-04 | Akane SHIMOKA | Document current Bun archive output |
