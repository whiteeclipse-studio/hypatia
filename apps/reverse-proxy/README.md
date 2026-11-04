---
id: reverse-proxy-readme
standard_revision: 1
---

# GitHub release archive proxy

`@whiteeclipse/reverse-proxy` is an exploratory Cloudflare Worker for browser documentation updates. It follows
GitHub release redirects on the server and streams archive bytes with CORS headers allowing `https://whiteeclipse.dev`.
The website remains a static application on DigitalOcean App Platform.

This application complements the exploratory website work associated with draft
[RFC-0002](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/rfcs/0002-tech-stack.md) and
[RFC-0005](https://github.com/whiteeclipse-studio/hypatia/blob/main/docs/internal/rfcs/0005-documentation-publication.md).
It does not record acceptance of those proposals or a production hosting decision.

## Setup and usage

Use Bun 1.4 or later. From the repository root:

```sh
bun install
bun run --cwd apps/reverse-proxy dev
```

Request `http://localhost:8787/ryugu.tgz`. Each single-segment path must be `<repository>.tgz` under
`whiteeclipse-studio`:

```text
/ryugu.tgz   -> https://github.com/whiteeclipse-studio/ryugu/releases/latest/download/ryugu.tgz
/hypatia.tgz -> https://github.com/whiteeclipse-studio/hypatia/releases/latest/download/hypatia.tgz
```

Repositories must be public and publish a stable `<repository>.tgz` asset in the release GitHub considers latest.
New repositories following this convention need no Worker configuration changes. Repository keys accept 1–100 ASCII
letters, digits, periods, underscores and hyphens; `.` and `..`, encoded keys and additional path segments are rejected.
The final `.tgz` extension is required and removed once to determine the repository key. Missing or different
extensions return HTTP 400 without contacting GitHub.
Query parameters do not select the upstream. The GitHub organization and permitted browser origin are constants in
`src/index.ts`.

GET downloads and OPTIONS preflights are supported. HTTP validators are forwarded and exposed to the browser;
upstream statuses, including 304 and missing assets, are preserved. Network failures return 502. Archive bodies are
streamed without adding a content-encoding layer. Browser cookies and authorization are not forwarded to GitHub.
There is no application cache, token, or private repository support. CORS limits browser readability; the endpoint
remains publicly callable and consumes the Worker's request allowance.

## Cloudflare deployment

Connect the `whiteeclipse-studio/hypatia` repository in Cloudflare Workers & Pages, using these settings:

| Setting                      | Value                                              |
|------------------------------|----------------------------------------------------|
| Project name                 | `hypatia-reverse-proxy`, matching `wrangler.jsonc` |
| Root directory               | Repository root                                    |
| Build command                | `bun install --frozen-lockfile`                    |
| Deploy command               | `bun run --cwd apps/reverse-proxy deploy`          |
| Preview builds               | Disabled initially                                 |
| Cloudflare Access protection | Disabled, so the website can fetch archives        |

Wrangler bundles TypeScript during deployment; no separate build command is needed. Cloudflare's repository
integration supplies deployment authentication. No GitHub token is required for public archives.
If the creation screen does not expose a branch selector, create the Worker, then open Settings → Builds → Branch
control and set Production branch to `feature/website` for the temporary website iteration. Trigger a new build
after changing the branch; the initial build may fail if the default branch does not contain this application yet.
If enabling preview builds later, use
`bun run --cwd apps/reverse-proxy wrangler versions upload` as the preview command.

For deployment from this computer, authenticate once with `bun run --cwd apps/reverse-proxy wrangler login`,
then run `bun run --cwd apps/reverse-proxy deploy`. Wrangler's local state and development secrets are ignored by Git.

After deployment, set the website project's browser update URL to the assigned Worker address:

```ts
archiveUrl: "https://hypatia-reverse-proxy.z8hm5znzhn.workers.dev/ryugu.tgz",
```

Keep the website's build-time `source.url` pointing directly to GitHub, then rebuild and deploy the website to publish
the new browser URL. No DigitalOcean routing or domain changes are required.

## Verification

From the repository root:

```sh
bun run --cwd apps/reverse-proxy typecheck
bun run --cwd apps/reverse-proxy lint
bun run --cwd apps/reverse-proxy test
bun run --cwd apps/reverse-proxy build
```

The build is a Wrangler dry run that emits the bundle into `dist` without deploying. Tests use synthetic responses
to cover repository mapping, streamed bytes, CORS preflights, conditional requests, invalid paths and methods, and
upstream failures. After deployment, verify an Update request from `whiteeclipse.dev` in a browser; local checks do
not establish live Cloudflare or GitHub availability.

## Copyright and licence

Copyright © 2026 White Eclipse.

Released under the [MIT License](https://whiteeclipse.dev/LICENCE).

## Revisions

| Revision | Date       | Author | Description                                                         |
|----------|------------|--------|---------------------------------------------------------------------|
| 1        | 2026-11-04 | Codex  | Introduce the repository archive Worker and deployment instructions |
| 2        | 2026-11-04 | Codex  | Require the .tgz extension on archive request URLs                  |
