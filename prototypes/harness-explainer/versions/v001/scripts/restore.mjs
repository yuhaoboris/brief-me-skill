import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

process.chdir(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const manifest = JSON.parse(await readFile('versions/manifest.json', 'utf8'));
const id = process.argv[2];
const version = manifest.versions.find(v => v.id === id);
if (!version) throw new Error(`请指定已有版本：${manifest.versions.map(v => v.id).join(', ')}`);
const html = await readFile(`versions/${id}/index.html`);
if (createHash('sha256').update(html).digest('hex') !== version.htmlHash) throw new Error('归档内容校验失败，未恢复');
// Refuse to discard any unarchived manual edits to the stable entry.
try {
  const current = await readFile('index.html');
  const hash = createHash('sha256').update(current).digest('hex');
  if (!manifest.versions.some(v => v.htmlHash === hash)) throw new Error('入口含有未归档修改，请先保留该文件再恢复');
} catch (error) { if (error.code !== 'ENOENT') throw error; }
await copyFile(`versions/${id}/index.html`, 'index.html');
manifest.current = id;
await writeFile('versions/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`已恢复网页 ${id}。源码仍保留工作版本；归档源码位于 versions/${id}/。`);
