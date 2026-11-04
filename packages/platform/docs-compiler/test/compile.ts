/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import logging from "@whiteeclipse/log/default";
import { getLogger } from "@whiteeclipse/log";
import { compile, type CompilerPlugin } from "../src";
import { toText } from "hast-util-to-text";
import { linkResolver } from "../src/plugins/link-resolver";
import { archiveReader } from "../src/plugins/archive-reader";


const logger = getLogger(["docs-compiler", "test"]);
const plugin: CompilerPlugin = {
    name: "test",
    config() {
        this.logger.info("Running config hook.");
    },
    configResolved(configuration) {
        this.logger.info("Configured repositories: {repositories}", { repositories: configuration.repositories });
    },
    buildStart() {
        this.logger.info("Starting build.");
    },
    transform(value) {
        const type = "getArtifact" in value ? "repository" : value.path;
        this.logger.info("Transforming {type}.", { type });
        return undefined;
    },
};

try {
    await using snapshot = await compile({
        repositories: "./dist/docs/hypatia.tgz",
        // plugins: [filesystemLoader(), markdownParser(), linkResolver(), plugin, archiveWriter()],
        plugins: [archiveReader(), linkResolver(), plugin],
        watch: false,
    });
    for (const [, artifact] of snapshot.get("hypatia") ?? []) {
        if (artifact.type === "translation") {
            logger.info`${artifact.path} ${toText(await artifact.read())}`;
        }
    }
} finally {
    await logging[Symbol.asyncDispose]();
}
