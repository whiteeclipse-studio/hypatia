/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { expect, it } from "vitest";
import { parseArguments } from "./arguments.js";


it("builds the current directory with translations and syntax extensions enabled", () => {
    expect(parseArguments([])).toEqual({
        help: false,
        repositories: ["."],
        filesystem: { translations: true },
        markdown: { wikilinks: true, callouts: true },
        archive: {},
    });
});

it("maps paths, aliases, and repeated patterns while preserving their order", () => {
    expect(
        parseArguments([
            "one",
            "two",
            "-C",
            "./projects",
            "-o",
            "./archives",
            "--include",
            "docs/**/*.md",
            "--include",
            "README.md",
            "--exclude",
            "docs/private/**",
            "--exclude",
            "docs/drafts/**",
        ]),
    ).toMatchObject({
        repositories: ["one", "two"],
        filesystem: {
            cwd: "./projects",
            include: ["docs/**/*.md", "README.md"],
            exclude: ["docs/private/**", "docs/drafts/**"],
        },
        archive: { outputDirectory: "./archives" },
    });
});

it.each(["translations", "wikilinks", "callouts"])("uses the last %s switch", name => {
    const disabled = parseArguments([`--${name}`, `--no-${name}`]);
    const enabled = parseArguments([`--no-${name}`, `--${name}`]);
    expect({ ...disabled.filesystem, ...disabled.markdown }).toHaveProperty(name, false);
    expect({ ...enabled.filesystem, ...enabled.markdown }).toHaveProperty(name, true);
});

it("recognizes help and accepts dash-prefixed repository paths after --", () => {
    expect(parseArguments(["-h"]).help).toBe(true);
    expect(parseArguments(["--", "-project"]).repositories).toEqual(["-project"]);
});

it.each([
    ["--unknown"],
    ["--include"],
    ["-o"],
    ["--cwd="],
    ["--include="],
    ["--exclude="],
    ["--output-directory="],
    [""],
    ["--no-unknown"],
])("rejects invalid arguments %j", (...args) => {
    expect(() => parseArguments(args)).toThrow();
});
