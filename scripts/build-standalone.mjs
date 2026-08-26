import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
const moduleFiles = [
  'src/supplemental-writing-data.js',
  'src/data.js',
  'src/reading-form-02.js',
  'src/reading-data.js',
  'src/focused-reading-data.js',
  'src/official-sources.js',
  'src/blueprints.js',
  'src/ctest.js',
  'src/content-intelligence.js',
  'src/reading.js',
  'src/storage.js',
  'src/scoring.js'
];
let bundle = '';
for (const file of moduleFiles) {
  let source = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
  source = source.replace(/^import[\s\S]*?from\s+['"][^'"]+['"];\s*/gm, '').replace(/^export\s+/gm, '');
  bundle += `\n/* ${file} */\n${source}\n`;
}
let app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
const appStart = app.indexOf('const app =');
if (appStart < 0) throw new Error('Could not locate app body.');
app = app.slice(appStart);
bundle += `\n/* src/app.js */\n${app}\n`;

const html = `<!doctype html>
<html lang="zh-Hant" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#006a70">
<title>TOEFL 2026 Practice Lab — Standalone</title>
<style>${css}</style>
</head>
<body>
<div id="app"><noscript>This practice interface requires JavaScript.</noscript></div>
<script type="module">${bundle.replaceAll('</script>', '<\\/script>')}</script>
</body>
</html>`;
await writeFile(new URL('../standalone.html', import.meta.url), html);
console.log('Built standalone.html');
