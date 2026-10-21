import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

const appRoot = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('src/components/catalogue.json', appRoot), 'utf8'));
const index = JSON.parse(await readFile(new URL('storybook-static/index.json', appRoot), 'utf8'));

/** Extracts runtime export names from Radix's public declaration entrypoint. */
function declarationExports(source) {
    const names = [];
    for (const line of source.split('\n')) {
        const namespace = line.match(/^export \* as (\w+)/);
        if (namespace) names.push(namespace[1]);
        const named = line.match(/^export \{ (.+) \}/);
        if (!named) continue;
        for (const member of named[1].split(',')) {
            const entry = member.trim();
            if (!entry || entry.startsWith('type ')) continue;
            names.push(entry.split(' as ').at(-1));
        }
    }
    return names;
}

/** Checks that an upstream public export is either demonstrated or explicitly described. */
function verifyCoverage(names, coverage, helpers = {}) {
    for (const name of names) {
        assert(name in coverage || name in helpers, `Missing upstream export coverage: ${name}`);
    }
    for (const [name, title] of Object.entries(coverage)) {
        assert(names.includes(name), `Stale coverage entry: ${name}`);
        assert(manifest.studies.some(study => study.title === title), `Missing study for ${name}: ${title}`);
    }
}

const themesSource = await readFile(new URL('../../packages/platform/core-ui/node_modules/@radix-ui/themes/dist/esm/components/index.d.ts', appRoot), 'utf8');
const primitiveSource = await readFile(new URL('../../packages/platform/core-ui/node_modules/radix-ui/dist/index.d.ts', appRoot), 'utf8');
verifyCoverage(declarationExports(themesSource), manifest.themes, manifest.themeHelpers);
verifyCoverage(declarationExports(primitiveSource), manifest.primitives);

const titles = new Set();
for (const study of manifest.studies) {
    assert(!titles.has(study.title), `Duplicate title: ${study.title}`);
    titles.add(study.title);
    assert(study.title.startsWith('Components/'), `Study is outside the area hierarchy: ${study.title}`);
    await access(new URL(study.file, appRoot));
    const stories = Object.values(index.entries).filter(entry => entry.title === study.title);
    assert.deepEqual(stories.map(entry => entry.name).sort(), ['Comparison', 'Playground'], `Incomplete views: ${study.title}`);
    for (const story of stories) {
        assert(story.importPath.endsWith(study.file), `Wrong source path for ${story.id}`);
    }
}
// Page compositions have explicit views of their own, separate from the two
// required views per component. Count both so unexpected stories still fail.
let sampleCount = 0;
for (const sample of manifest.samples) {
    assert(!titles.has(sample.title), `Duplicate title: ${sample.title}`);
    titles.add(sample.title);
    assert(sample.title.startsWith('Samples/'), `Sample is outside its hierarchy: ${sample.title}`);
    await access(new URL(sample.file, appRoot));
    const stories = Object.values(index.entries).filter(entry => entry.title === sample.title);
    assert.deepEqual(stories.map(entry => entry.name).sort(), [...sample.stories].sort(), `Incomplete sample: ${sample.title}`);
    for (const story of stories) {
        assert(story.importPath.endsWith(sample.file), `Wrong source path for ${story.id}`);
    }
    sampleCount += sample.stories.length;
}
assert.equal(Object.keys(index.entries).length, manifest.studies.length * 2 + sampleCount, 'Untracked or missing stories');
console.log(`Catalogue verified: ${manifest.studies.length} studies, ${sampleCount} sample stories, ${Object.keys(index.entries).length} total stories, full installed Radix export coverage.`);
