// Build the hosted, installable app into dist/: a copy of src/ with
// app.html as index.html (GitHub Pages serves index.html at the root) and
// sw.js filled in with the version and the list of files to cache.
//
//   bun tools/pwa.js [version]    version defaults to $VERSION or git
import { $ } from 'bun';
import { cp, readdir, rm, rename } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = join(import.meta.dir, '..'),
  dist = join(root, 'dist');

async function* Walk(dir) {
  for(const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);

    if(e.isDirectory()) yield* Walk(p);
    else yield p;
  }
}

const version = process.argv[2] ?? process.env.VERSION ?? (await $`git -C ${root} rev-parse --short HEAD`.text()).trim();

await rm(dist, { recursive: true, force: true });
await cp(join(root, 'src'), dist, { recursive: true });
await rename(join(dist, 'app.html'), join(dist, 'index.html'));

const files = ['./'];

for await(const p of Walk(dist)) {
  const f = relative(dist, p);

  if(f !== 'sw.js') files.push(f);
}

const sw = join(dist, 'sw.js'),
  text = (await Bun.file(sw).text())
    .replace(/const VERSION = .*;/, `const VERSION = ${JSON.stringify(version)};`)
    .replace(/const FILES = .*;/, `const FILES = ${JSON.stringify(files.sort())};`);

await Bun.write(sw, text);
console.log(`dist/: version ${version}, ${files.length} files`);
