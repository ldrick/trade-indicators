/**
 * `@effect/docgen` builds "Source" links from `srcLink` plus the file's basename only,
 * which breaks for nested source folders (`src/averages/sma.ts` becomes `src/sma.ts`).
 * Every generated page `docs/modules/<path>.ts.md` documents `src/<path>.ts`,
 * so the correct link path is derived from the page's own location.
 */
import { glob, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const modulesDirectory = 'docs/modules';
const sourceLink = 'https://github.com/ldrick/trade-indicators/blob/main/src/';

for await (const page of glob(`${modulesDirectory}/**/*.ts.md`)) {
	const sourcePath = path
		.relative(modulesDirectory, page)
		.slice(0, -'.md'.length)
		.replaceAll('\\', '/');
	const content = await readFile(page, 'utf8');
	const fixed = content
		.split(`${sourceLink}${path.basename(sourcePath)}#`)
		.join(`${sourceLink}${sourcePath}#`);
	await writeFile(page, fixed);
}
