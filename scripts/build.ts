/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { assembleSite } from "./assemble";

const root = fileURLToPath(new URL("../", import.meta.url));

/**
 * Runs an established workspace command and stops the combined build on failure.
 *
 * @param args - Arguments passed to the current Bun executable.
 * @returns Completion after a successful command.
 * @rejects If the command cannot start or exits unsuccessfully.
 */
async function run(args: readonly string[]): Promise<void> {
    await new Promise<void>((resolveCompletion, reject) => {
        const child = spawn(process.execPath, args, { cwd: root, stdio: "inherit" });
        child.once("error", (error: Error) => {
            reject(error);
        });
        child.once("exit", code => {
            if (code === 0) {
                resolveCompletion();
            } else {
                reject(new Error(`Build step failed (${String(code)}): bun ${args.join(" ")}`));
            }
        });
    });
}

await run(["run", "typecheck"]);
await run(["run", "--cwd", "packages/platform/core-ui", "build"]);
await run(["run", "--cwd", "apps/storybook", "build"]);
await run(["run", "--cwd", "apps/landing", "build:static"]);
await run(["run", "--cwd", "apps/documentation", "build"]);
await assembleSite(root);
process.stdout.write("Assembled landing at dist/ and documentation at dist/docs/.\n");
