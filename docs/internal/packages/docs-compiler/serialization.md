---
id: docs-compiler-serialization
parent: ./README.md
---

# Serialization

The version-1 archive representation transfers a Repository between the [[./plugins/archive-writer.md|archive writer]]
and [[./plugins/archive-reader.md|archive reader]]. See the [[./README.md|package documentation]] for coverage.
Serialization is outside the rebuilt RFC-0005 proposal's scope.

## Container and keys

Archives contain gzip-compressed TAR, using `.tgz` for writer output; the reader also recognizes `.tar.gz` inputs. The
fixed file layout is:

```text
manifest.json
artifacts/<artifact-key>.json
payloads/<payload-key>
```

Artifact and payload keys are
opaque [UUIDv7 identifiers (RFC 9562, section 5.7)](https://www.rfc-editor.org/rfc/rfc9562.html#section-5.7),
independent of logical paths, document IDs, and runtime cache keys. The writer generates fresh keys per encoding.
Artifacts without binary content have no payload entry.

## Manifest

```ts
interface SerializedManifest {
    readonly formatVersion: 1;
    readonly repository: {
        readonly id: string;
        readonly name: string;
        readonly metadata: unknown;
    };
    readonly artifacts: Readonly<Record<string, string>>;
}
```

`formatVersion` versions the stored schema independently of the package version and document revisions. Only 1 is
supported. Repository metadata is JSON data. `artifacts` maps each normalized logical path to the key locating its JSON
record. Inventory order has no significance.

Every referenced record must exist and its `path` must equal the manifest path. The archive reader rejects files not
reachable through the manifest and artifact payload references. Metadata extension fields are allowed within their
contracts; unknown manifest, repository-envelope, or record-envelope fields are rejected.

The current manifest schema requires a non-empty Repository ID; it does not enforce every identifier restriction
proposed in RFC-0005. Archive schema validation is not complete RFC conformance validation.

## Artifact records

```ts
type SerializedArtifact =
    | {
          readonly path: string;
          readonly type: "document";
          readonly metadata: DocumentArtifactMetadata;
          readonly content: Root;
      }
    | {
          readonly path: string;
          readonly type: "translation";
          readonly metadata: TranslationArtifactMetadata;
          readonly content: Root;
      }
    | {
          readonly path: string;
          readonly type: "asset";
          readonly metadata: AssetArtifactMetadata;
          readonly payload: string;
      }
    | {
          readonly path: string;
          readonly type: "unknown";
          readonly metadata: unknown;
      };
```

The types referenced here follow [[./artifacts.md|Artifacts]]. All metadata and inline content are JSON values. Runtime
methods, resource ownership, and cache payload descriptors are not serialized.

| Type          | Stored content                                                                                   |
|---------------|--------------------------------------------------------------------------------------------------|
| `document`    | Article HAST in `content`; notice and revision HAST in metadata.                                 |
| `translation` | Translated article HAST in `content`, with translation metadata; canonical source may be absent. |
| `asset`       | Binary bytes at `payloads/<payload>`; record metadata supplies MIME and byte size.               |
| `unknown`     | Metadata only; reconstructed reads return `undefined`.                                           |

Paths must already be normalized. Validation never repairs stored paths. Documents and translations have no external
content pointer. Assets have no inline content or base64 bytes. Unknown records have neither content nor payload fields.

## Encoding

`encodeRepository(repository, signal?)` is an internal source module used by archive-writer. It creates an entry map
ready for TAR compression, checks matching inventory keys and artifact paths, validates schema values, and checks asset
Blob MIME and byte size against metadata. Unknown records do not trigger content reads.

Supply only JSON-representable metadata and HAST. Current JSON encoding uses `JSON.stringify`; it is not a lossless
arbitrary-object serializer and custom `toJSON` behavior is not a supported extension contract. The encoder collects a
repository's records and payloads before compression.

Output filenames, staging, replacement behavior, and runtime requirements belong to
the [[./plugins/archive-writer.md|archive writer reference]].

## Reading and validation

The reader bounds compressed input, decompressed TAR bytes, and header count, validates the fixed TAR layout, and checks
JSON schemas and cross-entry references before writing content to cache. Asset payload sizes must agree with metadata,
and MIME strings must be preserved by Blob construction. Supported HAST and metadata structures are checked with the
shared Zod schemas.

The reader uses strict UTF-8 for JSON and TAR names, rejects duplicate TAR paths, unsupported record variants and
versions, missing content, inventory/path mismatch, and unreferenced files. It never extracts entries to disk.
The [[./plugins/archive-reader.md|archive reader reference]] defines exact bounds, accepted TAR forms, and cancellation.

Structural validation does not check archive authenticity, global document-ID uniqueness, every proposed RFC invariant,
binary format safety, or publication readiness. Consumers sanitize rendered output and validate supported assets as
required by the [[../../../standards/PUBLICATION.md|publication standard]].

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description                                                                       |
|----------|------------|---------------|-----------------------------------------------------------------------------------|
| 1        | 2026-10-29 | Akane SHIMOKA | Define archive format, UUIDv7 keys, and JSON validation                           |
| 2        | 2026-11-02 | Akane SHIMOKA | Add document navigation links                                                     |
| 3        | 2026-11-03 | Akane SHIMOKA | Define inline document JSON, separate asset payloads, and native archive encoding |
| 4        | 2026-11-04 | Akane SHIMOKA | Rebuild format reference for current writer and reader                            |
