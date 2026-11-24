const raw = 'https://raw.githubusercontent.com/shellsec/lx-music-source/master/';
module.exports = [
  { id: 'ghfast', name: '加速 · ghfast.top', file: 'sources.ghfast.json', base: 'https://ghfast.top/' + raw },
  { id: 'monlor', name: '备用加速 · gh.monlor.com', file: 'sources.monlor.json', base: 'https://gh.monlor.com/' + raw },
  { id: 'gh-proxy', name: '备用加速 · gh-proxy.org', file: 'sources.gh-proxy.json', base: 'https://gh-proxy.org/' + raw },
  { id: 'direct', name: 'GitHub 直连', file: 'sources.direct.json', base: raw },
];
