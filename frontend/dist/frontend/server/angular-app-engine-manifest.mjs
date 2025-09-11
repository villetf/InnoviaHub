
export default {
  basePath: 'https://villetf.github.io/InnoviaHub',
  supportedLocales: {
  "en-US": ""
},
  entryPoints: {
    '': () => import('./main.server.mjs')
  },
};
