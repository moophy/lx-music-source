const raw = 'https://raw.githubusercontent.com/shellsec/lx-music-source/master/';
module.exports = [
  { id: 'ghfast', name: '默认加速 · ghfast.top', file: 'sources.json', base: 'https://ghfast.top/' + raw },
  { id: 'monlor', name: '备用加速 · gh.monlor.com', file: 'sources.monlor.json', base: 'https://gh.monlor.com/' + raw },
  { id: 'acmsz', name: '备用加速 · gh.acmsz.top', file: 'sources.acmsz.json', base: 'https://gh.acmsz.top/' + raw },
  { id: 'direct', name: 'GitHub 直连', file: 'sources.direct.json', base: raw },
];
