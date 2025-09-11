
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: 'https://villetf.github.io/InnoviaHub/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/InnoviaHub/profil"
  },
  {
    "renderMode": 2,
    "route": "/InnoviaHub/boka"
  },
  {
    "renderMode": 2,
    "route": "/InnoviaHub/sensorer"
  },
  {
    "renderMode": 2,
    "route": "/InnoviaHub/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 14582, hash: '4b193c5928cefa1630db54499557345e1f6e139f8d6472dba47153dbf53ee56e', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 11676, hash: '2ff18cf27d76e42a7c8c6a6acee7d61ca2a0eefcb01b51071240616ba4611d74', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'boka/index.html': {size: 23540, hash: '8774e36f420486db0ba7c6cfbec326e6ffa88a25efd9b0e8a25d0889795d6cff', text: () => import('./assets-chunks/boka_index_html.mjs').then(m => m.default)},
    'profil/index.html': {size: 23541, hash: '98326b0029a8e90fe46e96b3a015fa09ea58e9ac444f755edcc39a7f86b8f015', text: () => import('./assets-chunks/profil_index_html.mjs').then(m => m.default)},
    'sensorer/index.html': {size: 23538, hash: '1519a5fe48a9c0caaecfe35007455db1b002d46c835966cfd9cc52570d1e3364', text: () => import('./assets-chunks/sensorer_index_html.mjs').then(m => m.default)},
    'styles-2VOUP2PQ.css': {size: 7201, hash: '4I6OkwjBPr4', text: () => import('./assets-chunks/styles-2VOUP2PQ_css.mjs').then(m => m.default)}
  },
};
