import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import copy from 'rollup-plugin-copy'
import pkg from './package.json'

export default [
  // browser-friendly UMD build
  {
    input: 'src/index.js',
    output: {
      name: 'easylog',
      format: 'umd',
      file: pkg.browser
    },
    watch: {
      include: 'src/**'
    },
    plugins: [
      resolve(), // so Rollup can find npm modules
      commonjs(), // so Rollup can convert `ms` to an ES module
      // copy({
      //   targets: [
      //     { src: 'dist/*', dest: '../web/node_modules/easylog/dist' },
      //     { src: 'package.json', dest: '../web/node_modules/easylog' },
      //   ]
      // })
    ],
    external: ['axios']
  },
  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  // {
  //   input: 'src/index.js',
  //   external: ['axios'],
  //   watch: {
  //     include: 'src/**'
  //   },
  //   output: [{ file: pkg.main, format: 'cjs' }, { file: pkg.module, format: 'es' }]
  // }
]
