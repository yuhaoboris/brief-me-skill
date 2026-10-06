import { mkdir, readFile, writeFile, readdir, cp } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import { modules, relations } from '../src/content.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const preview = process.argv.includes('--preview');
const noteArg = process.argv.indexOf('--note');
const note = noteArg >= 0 ? process.argv[noteArg + 1] : '首稿：核心结构、关系解释和原文依据。';
if (!note) throw new Error('--note 后需要填写本次变化');
const rawSource = JSON.parse(await readFile('source.json', 'utf8'));
const sourceText = Object.fromEntries(rawSource.turns.map((turn, i) => [`S${i + 1}`, turn.answer]));
const ids = new Set(modules.map(m => m.id));
if (ids.size !== modules.length) throw new Error('模块 ID 重复');
for (const relation of relations) {
  if (!ids.has(relation.from) || !ids.has(relation.to)) throw new Error(`关系端点不存在：${relation.id}`);
}
for (const item of [...modules, ...relations]) {
  for (const e of item.evidence) {
    if (!sourceText[e.source]?.includes(e.quote)) throw new Error(`原文摘录不匹配：${item.id} / ${e.source} / ${e.quote}`);
  }
}

async function fingerprint() {
  const h = createHash('sha256');
  for (const file of ['package.json', 'package-lock.json', 'tsconfig.json', 'source.json', 'scripts/build.mjs', ...(await readdir('src')).sort().map(f => `src/${f}`)]) {
    h.update(file).update(await readFile(file));
  }
  return h.digest('hex');
}
let manifest = { schemaVersion: 1, topic: rawSource.threadId, current: null, versions: [] };
try { manifest = JSON.parse(await readFile('versions/manifest.json', 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
if (!preview) {
  try {
    const currentHash = createHash('sha256').update(await readFile('index.html')).digest('hex');
    if (!manifest.versions.some(v => v.htmlHash === currentHash)) throw new Error('入口含未归档修改，请先保留该文件再构建');
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const sourceHash = await fingerprint();
const previousEntry = manifest.versions.find(v => v.sourceHash === sourceHash);
if (!preview && previousEntry) {
  await cp(`versions/${previousEntry.id}/index.html`, 'index.html');
  manifest.current = previousEntry.id;
  await writeFile('versions/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
  console.log(`内容未变；入口恢复为 ${previousEntry.id}。`);
  process.exit(0);
}
const id = preview ? '预览' : `v${String(manifest.versions.length + 1).padStart(3, '0')}`;
const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date());
const edition = { id, date, changes: note, previous: manifest.versions.slice().reverse().map(({ id, date, changes }) => ({ id, date, changes })) };
const css = (await postcss([tailwindcss()]).process(await readFile('src/style.css', 'utf8'), { from: resolve('src/style.css') })).css;
const result = await build({
  entryPoints: ['src/App.tsx'], bundle: true, write: false, minify: true,
  format: 'iife', target: ['es2020'], legalComments: 'inline',
  define: { 'process.env.NODE_ENV': '"production"', '__EDITION__': JSON.stringify(edition) },
});
const js = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const fallback = `<noscript><main style="padding-top:40px"><p>交互需要启用 JavaScript。以下是核心内容。</p><h1>DeepSeek Harness 的核心结构</h1><p>依据来自两轮讨论，未重新核验源码。图的分组属于模型整理。</p>${modules.map(m => `<section style="margin:24px 0"><h2>${escape(m.name)}</h2><p>${escape(m.description)}</p><p>${escape(m.boundary)}</p></section>`).join('')}<h2>主要关系</h2>${relations.map(r => `<p><strong>${escape(r.name)}</strong>：${escape(r.description)}</p>`).join('')}</main></noscript>`;
const html = `<!doctype html>\n<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="description" content="DeepSeek Harness 架构解释：先整体，后局部。"><title>DeepSeek Harness 的核心结构 · brief-me</title><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23203e34'/%3E%3Cpath d='m6 12 10-5 10 5-10 5-10-5m0 6 10 5 10-5' fill='none' stroke='%23ffffff' stroke-width='2'/%3E%3C/svg%3E"><style>${css}</style></head><body><div id="root"></div>${fallback}<script>${js}</script></body></html>\n`;
if (/<script[^>]+src=|<link[^>]+href=["']https?:|@import\s/.test(html)) throw new Error('产物仍有外部运行依赖');
const target = preview ? '.preview/index.html' : 'index.html';
await mkdir(dirname(target), { recursive: true });
if (!preview) {
  const archive = `versions/${id}`;
  await mkdir(archive, { recursive: true });
  for (const file of ['src', 'scripts', 'package.json', 'package-lock.json', 'tsconfig.json', 'source.json']) await cp(file, `${archive}/${file}`, { recursive: true });
  await writeFile(`${archive}/index.html`, html);
  const entry = { id, date, changes: note, sourceHash, htmlHash: createHash('sha256').update(html).digest('hex') };
  manifest.versions.push(entry);
  manifest.current = id;
  await writeFile('versions/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
}
await writeFile(target, html);
console.log(`${target}: ${Buffer.byteLength(html).toLocaleString()} bytes; ${modules.length} 个模块；${relations.length} 条连接；摘录匹配。`);
