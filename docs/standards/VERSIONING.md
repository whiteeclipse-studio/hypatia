---
id: std-versioning
---

# Software versioning standard

This standard defines how applications and reusable packages are versioned, including pre-releases and the handling of published versions. See the [standards entrypoint](./README.md).

## Rules

The scheme MUST follow the artifact's role rather than its distribution method.

### Application and product releases

Applications and products released for direct use MUST use calendar versioning: `YYYY.RELEASE.PATCH`.

- `YYYY` MUST identify the year of the feature release.
- `RELEASE` MUST start at 1 each year and increase for each new feature release.
- `PATCH` MUST start at 0 for each feature release and increase for bug fixes.
- Maintenance updates MUST retain their release line's year and release number, even when published in a later year.
    - For example, a fix to `2026.2.0` released in 2027 would be `2026.2.1`.

### Reusable packages

Packages, libraries, and SDKs consumed as dependencies MUST use [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html): `MAJOR.MINOR.PATCH`. This includes reusable dependencies shipped alongside an application.

- Package versions MAY evolve independently of application release labels.
- If an artifact serves both roles, its dependency-facing version MUST follow Semantic Versioning. A separate calendar product label MAY be maintained.

### Compatibility and release contents

- Applications exposing APIs, plugin interfaces, or data formats MUST document their compatibility policies independently of the calendar release label. These contracts MUST have explicit versions when consumers need to distinguish incompatible forms.
- Application and product releases MUST identify included reusable package versions in a release record or build manifest.

### Pre-releases

- Both schemes MAY append a pre-release identifier, such as `-beta.1`, and build metadata, such as `+build.42`. Their syntax and precedence MUST follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
- Calendar-versioned pre-releases MUST use the base version of their intended stable release.

### Published versions

Published application and package artifacts, including pre-releases, MUST NOT be modified or replaced under an existing version number. Corrections MUST use a new version.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-26 | Akane SHIMOKA | Initial draft |
