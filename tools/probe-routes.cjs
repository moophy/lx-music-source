const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFile } = require('node:child_process');
const routes = require('./source-routes.cjs');
const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const output = args[args.indexOf('--output') + 1];
if (!args.includes('--output') || !output) throw new Error('Usage: node tools/probe-routes.cjs --output tests/routes-DATE.json [--published]');
const published = args.includes('--published');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'sources.json'), 'utf8'));
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const jobs = routes.flatMap(route => [
  { route, file: published ? route.file : 'sources.json' },
  ...manifest.sources.map(s => ({ route, file: 'sources/' + s.id + '/' + encodeURIComponent(s.name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').replace(/[. ]+$/, '')) + '.js' })),
]);
async function check({ route, file }) {
  const temp = path.join(os.tmpdir(), 'lx-route-' + crypto.randomUUID());
  const result = { route: route.id, file, url: route.base + file };
  try {
    const meta = await new Promise((resolve, reject) => execFile('curl.exe', ['-fLsS', '--connect-timeout', '5', '--max-time', '20', '--max-filesize', '3000000', result.url, '-o', temp, '-w', '%{http_code} %{time_total}'], (error, stdout) => error ? reject(new Error(`${stdout.trim()} curl exit ${error.code}`)) : resolve(stdout.trim())));
    const body = fs.readFileSync(temp);
    const expected = fs.readFileSync(path.join(root, decodeURIComponent(file)));
    Object.assign(result, { status: Number(meta.split(' ')[0]), seconds: Number(meta.split(' ')[1]), bytes: body.length, sha256: hash(body), expectedSha256: hash(expected), matches: hash(body) === hash(expected) });
  } catch (error) { result.error = error.message; }
  finally { if (fs.existsSync(temp)) fs.unlinkSync(temp); }
  return result;
}
(async () => {
  const results = [];
  let next = 0;
  await Promise.all(Array.from({ length: 2 }, async () => {
    while (next < jobs.length) {
      const job = jobs[next++];
      let result = await check(job);
      if (result.error) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const retry = await check(job);
        result = { ...retry, firstFailure: result.error };
      }
      results.push(result);
    }
  }));
  results.sort((a, b) => (a.route + a.file).localeCompare(b.route + b.file));
  fs.writeFileSync(path.resolve(root, output), JSON.stringify({ testedAt: new Date().toISOString(), scope: published ? 'Published per-route manifests and all collected JS files; full-body SHA-256 comparison.' : 'Existing manifest and all collected JS files via each proposed route; full-body SHA-256 comparison.', results }, null, 2) + '\n');
  for (const r of routes) {
    const group = results.filter(x => x.route === r.id);
    console.log(`${r.id}: ${group.filter(x => x.matches).length}/${group.length} match`);
  }
  if (results.some(r => !r.matches)) process.exitCode = 1;
})();
