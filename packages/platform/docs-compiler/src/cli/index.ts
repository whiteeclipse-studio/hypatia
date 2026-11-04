#!/usr/bin/env bun
/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { HELP, parseArguments } from "./arguments.js";


try {
    const [, , ...args] = process.argv;
    const options = parseArguments(args);
    if (options.help) {
        process.stdout.write(HELP);
    } else {
        const { run } = await import("./run.js");
        await run(options);
    }
} catch (error) {
    process.stderr.write(`docs-compiler: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
}
