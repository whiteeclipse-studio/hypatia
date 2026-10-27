/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { chmod, copyFile, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const executableMode = 0o755;
const distribution = new URL("../dist/", import.meta.url);
for (const name of await readdir(distribution, { recursive: true })) {
    if (!name.endsWith(".js")) {
        continue;
    }
    const file = new URL(name, distribution);
    const source = await readFile(file, "utf8");
    // Rebase worker URLs after bundling while retaining static URLs for consumer bundlers.
    const portable = source.replace(
        /new URL\("\.\.\/workers\/(?<worker>(?:source|artifact)\.worker)\.ts",\s*import\.meta\.url\)/gu,
        /**
         * Rebases a worker reference to its distributed JavaScript entrypoint.
         *
         * @param _match - Original constructor expression.
         * @param worker - Worker basename.
         * @returns A statically discoverable URL expression.
         */
        function workerUrl(_match, worker: string): string {
            const target = resolve(fileURLToPath(distribution), "workers", `${worker}.js`);
            const path = relative(dirname(fileURLToPath(file)), target);
            const url = path.startsWith(".") ? path : `./${path}`;
            return `new URL(${JSON.stringify(url)}, import.meta.url)`;
        },
    );
    if (portable !== source) {
        await writeFile(file, portable);
    }
}

const cli = new URL("../dist/cli.js", import.meta.url);
const contents = await readFile(cli, "utf8");
if (!contents.startsWith("#!/usr/bin/env bun\n")) {
    await writeFile(cli, `#!/usr/bin/env bun\n${contents}`);
}
await chmod(cli, executableMode);
await copyFile(new URL("../src/callouts.css", import.meta.url), new URL("../dist/callouts.css", import.meta.url));
await copyFile(new URL("../../../../LICENCE", import.meta.url), new URL("../LICENCE", import.meta.url));
