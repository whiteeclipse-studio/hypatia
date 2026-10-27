---
id: rfc-0003
standard_revision: 1
status: draft
---

# rfc-0003 — Engineering conventions

This RFC defines how Hypatia's code is organized, documented, tested, and checked.

## Proposal

### Scope

These conventions cover repository code, its public interfaces, documentation, tests, and automated quality checks. Application features, technology selection beyond development checks, UI design, and deployment and publication mechanisms are outside their scope.

### Code quality

#### Readability and responsibilities

- Readability MUST take precedence over brevity. Dense expressions and unnecessary fragmentation MUST NOT be used merely to reduce line counts.
- Functions SHOULD be short and have narrow responsibilities. Computation SHOULD be pure, with side effects isolated in clearly identified functions.
- Files MUST be organized by responsibility; files exceeding 200 lines SHOULD be exceptional.
- Public interfaces SHOULD expose only what consumers need and keep implementation details private.

#### Type safety and documentation

- Repository code MUST NOT use TypeScript's `any` type.
- Functions and interfaces MUST have JSDoc explaining their behaviour, including relevant inputs, results, side effects, and failures.
- Functions that can throw MUST document the circumstances with `@throws`; asynchronous functions MUST document rejection behaviour. Artificial failure tags are not required where no failure applies.
- Comments SHOULD clarify what readable code cannot express; they MUST NOT substitute for clear code.

#### JSX and asynchronous behaviour

- JSX presentation and business logic MUST remain separate. Complex ternaries, inline `Array.map` calls, and similar processing MUST be moved into a component, hook, or simple logic above the JSX, according to responsibility.
- Promise rejections MUST be handled or propagated through a documented failure contract. `void` MAY discard a promise result only when the promise is guaranteed not to reject.

### Testing

Tests are OPTIONAL for exploratory work not covered by an accepted RFC or design proposal. The unit, component, integration, and test-execution requirements below apply outside that exemption.

- **Unit tests:** Vitest MUST be used. Tests SHOULD cover public behaviour with effort proportionate to complexity and consequences. Omitting tests for meaningful public behaviour MUST have a brief rationale recorded with the change.
- **Component tests:** Storybook component tests MUST use Vitest and cover specified variants, states, and main interactions. Rendering alone does not verify behaviour.
- **Integration tests:** All applications MUST use Playwright to cover main user journeys and significant failure or recovery paths against production builds.
- **Quality:** Tests MUST be deterministic. Failures MUST NOT be hidden by disabling tests or weakening assertions.
- **Production promotion:** Before exploratory code enters production, its coverage MUST be reviewed against these requirements, with applicable tests implemented and passing and any unit-test omissions explained.

### Automated checks

#### Shared toolchain

A reusable `@whiteeclipse/toolchain` package MUST be provided at `packages/libraries/toolchain`, exporting shared ESLint and Prettier configurations through `@whiteeclipse/toolchain/eslint` and `@whiteeclipse/toolchain/prettier`. Repository source, configuration, and scripts MUST use these configurations; generated output MUST be excluded from source checks.

ESLint rules MUST derive from these conventions and cover general code quality, type-aware TypeScript checks, package import boundaries, JSDoc, and JSX restrictions. Prettier MUST provide consistent formatting through the shared configuration. Tool-specific exceptions MAY accommodate test fixtures without weakening checks for production code.

Consumers MAY extend the shared configurations but MUST NOT weaken this RFC's mandatory requirements. Rule suppressions MUST be narrowly scoped and justified.

The [existing implementation](https://github.com/whiteeclipse-studio/hypatia/tree/main/packages/libraries/toolchain) and [package README](https://github.com/whiteeclipse-studio/hypatia/blob/main/packages/libraries/toolchain/README.md) provide the starting point. Their existence does not establish that all requirements of this proposal have been implemented or validated.

#### Execution and CI

- TypeScript compiler checks MUST run separately from bundling and test execution, as part of the checking pipeline and before builds. Failed type checks MUST block builds.
- ESLint and Prettier checks MUST run on every push through GitHub Actions and pass for the latest pull request revision before merge.
- Outside the exploratory testing exemption, unit and component tests MUST run on every push through GitHub Actions and pass for the latest pull request revision before merge. Integration tests MUST also pass against production builds for that revision before merge.

### Consequences

Shared conventions and checks support consistent code and review, with maintenance and CI overhead. Automated checks cannot establish readability or correctness alone. Exploratory work can proceed without tests, but promotion requires reassessing coverage and completing the applicable checks.

## Alternatives considered

- **Per-package configurations:** allow more flexibility but duplicate maintenance and produce inconsistent checks.
- **Review without automated checks:** reduces tooling but adds repetitive review work and less consistent enforcement.
- **Mandatory tests during exploration:** provides earlier coverage but adds overhead for short-lived prototypes.

## Delivery and validation

Adopt the shared toolchain in repository configurations and scripts, then connect the required checks to GitHub Actions.

- Both toolchain exports load and are used by source, configuration, and script checks; generated output is excluded.
- Representative valid code passes, representative rule violations are reported, and formatting matches the shared configuration.
- Type errors block builds, and required lint, formatting, and test checks gate the latest pull request revision as specified.
- Integration tests run against production builds, and exploratory testing exemptions remain distinct from production-promotion requirements.

## Decision record

Acceptance is pending.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author        | Description   |
| -------- | ---------- | ------------- | ------------- |
| 1        | 2026-10-26 | Akane SHIMOKA | Initial draft |
