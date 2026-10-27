#!/usr/bin/env bun
/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import process from "node:process";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { buildDocumentation } from "./build/index.ts";
import { loadConfiguration } from "./build/configuration.ts";
import { writeArtifact } from "./build/write.ts";
import { DocumentationError, requireCondition } from "./errors.ts";

const usage = "Usage: documentation-builder build [repository-root] --out <artifact.tar.gz> [--config <file.mjs>]\n";
const executableArguments = 2;
const maximumPositionals = 2;

/**
 * Executes an artifact build with shared configuration and human-readable diagnostics.
 *
 * @returns Completion after the output has been atomically replaced.
 * @rejects For invalid CLI arguments, configuration, build, or output failures.
 */
async function main(): Promise<void> {
    const { values, positionals } = parseArgs({
        args: process.argv.slice(executableArguments),
        allowPositionals: true,
        options: {
            out: { type: "string" },
            config: { type: "string" },
            help: { type: "boolean", short: "h" },
        },
    });
    if (values.help === true) {
        process.stdout.write(usage);
        return;
    }
    requireCondition(
        positionals[0] === "build" && positionals.length <= maximumPositionals && values.out !== undefined,
        usage.trim(),
        "usage",
    );
    const repositoryRoot = resolve(positionals[1] ?? ".");
    const configuration = await loadConfiguration(repositoryRoot, values.config);
    const options = { ...configuration.options, repositoryRoot };
    const result = await buildDocumentation(options);
    for (const diagnostic of result.diagnostics) {
        process.stderr.write(`${diagnostic.path}: ${diagnostic.message}\n`);
    }
    const output = await writeArtifact(result, resolve(values.out), {
        repositoryRoot,
        ...(options.limits === undefined ? {} : { limits: options.limits }),
    });
    process.stdout.write(
        `${output}\n${result.manifest.pages.length} pages; ${result.manifest.source.commit}${result.manifest.source.dirty ? " (dirty source)" : ""}\n`,
    );
}

main().catch(function failure(error: unknown): void {
    const category = error instanceof DocumentationError ? `${error.code}: ` : "";
    process.stderr.write(`${category}${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
});
