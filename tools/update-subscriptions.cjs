const fs = require('node:fs');
const path = require('node:path');
const routes = require('./source-routes.cjs');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'sources.json'), 'utf8'));
const relative = s => `sources/${s.id}/${encodeURIComponent(s.name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').replace(/[. ]+$/, ''))}.js`;
const qr = url => `https://quickchart.io/qr?text=${encodeURIComponent(url)}&size=320&margin=4`;
const direct = routes.find(r => r.id === 'direct');
for (const route of routes) {
  const data = { sources: manifest.sources.map(s => ({ id: s.id, name: s.name, url: route.base + relative(s) })) };
  fs.writeFileSync(path.join(root, route.file), JSON.stringify(data, null, 2) + '\n');
}
fs.writeFileSync(path.join(root, 'sources.json'), JSON.stringify({
  sources: manifest.sources.map(s => ({ id: s.id, name: s.name, url: direct.base + relative(s) })),
}, null, 2) + '\n');
let readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const listed = [direct, ...routes.filter(r => r.id !== 'direct')];
const subscriptions = '| 访问方式 | 清单地址 | 二维码 |\n|---|---|---|\n' + listed.map(r => {
  const url = r.base + r.file;
  return `| ${r.name} | [加载订阅](${url}) | [生成订阅二维码](${qr(url)}) |`;
}).join('\n') + '\n';
readme = readme.replace(/\| 访问方式 \| 清单地址 \| 二维码 \|\r?\n\|[-| ]+\|\r?\n(?:\|[^\n]*\n)+/, subscriptions);
readme = readme.replace(/默认订阅使用 ghfast\.top[^\n]*|根目录 sources\.json 使用 GitHub 直连地址[^\n]*/, '根目录 sources.json 使用 GitHub 直连地址，原有 raw 订阅可以继续加载。加速订阅使用独立清单，清单内的 JS 地址也使用对应线路。某条线路不可用时，请切换整条订阅。旧版 gh-proxy.com 地址已停用，请更新订阅入口。');
const accelerated = routes.find(r => r.id === 'ghfast');
const table = '| 音源 | JS 直连地址 | JS 加速地址 | 二维码 |\n|---|---|---|---|\n' + manifest.sources.map(s => {
  const rawUrl = direct.base + relative(s);
  const fastUrl = accelerated.base + relative(s);
  return `| ${s.name} | [GitHub 直连](${rawUrl}) | [加速下载](${fastUrl}) | [生成二维码](${qr(rawUrl)}) |`;
}).join('\n') + '\n';
readme = readme.replace(/\| 音源 \| JS (?:加速地址 \| JS 直连地址|直连地址 \| JS 加速地址) \|[^\n]*\n\|[-| ]+\|\r?\n(?:\|[^\n]*\n)+/, table);
readme = readme.replace(/可复制下表的 JS (?:加速|直连)链接/, '可复制下表的 JS 直连链接');
readme = readme.replace(/当前收录 \d+ 个音源/, `当前收录 ${manifest.sources.length} 个音源`);
fs.writeFileSync(path.join(root, 'README.md'), readme);
