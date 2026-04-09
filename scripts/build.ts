#!/usr/bin/env bun
/**
 * Build script: bundles src/index.ts into dist/nod.js
 * - Inlines app.html as a string via the .html:text loader
 * - Prepends #!/usr/bin/env bun shebang
 * - Makes the output executable
 */

import * as fs from 'fs';
import * as path from 'path';

const OUT = path.join(import.meta.dir, '../dist/nod.js');
const pkg = JSON.parse(fs.readFileSync(path.join(import.meta.dir, '../package.json'), 'utf8'));

console.log('Building nod…');

const result = await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  naming: 'nod.js',
  target: 'bun',
  minify: false,
  sourcemap: 'none',
  loader: { '.html': 'text' },
  define: { __VERSION__: JSON.stringify(pkg.version) },
});

if (!result.success) {
  for (const msg of result.logs) {
    console.error(msg);
  }
  process.exit(1);
}

// Prepend shebang
const content = fs.readFileSync(OUT, 'utf8');
if (!content.startsWith('#!')) {
  fs.writeFileSync(OUT, `#!/usr/bin/env bun\n${content}`, 'utf8');
}

// Make executable
fs.chmodSync(OUT, 0o755);

const size = (fs.statSync(OUT).size / 1024).toFixed(1);
console.log(`✓ dist/nod.js  (${size} KB)`);
