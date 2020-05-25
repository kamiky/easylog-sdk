import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import copy from 'rollup-plugin-copy'
import pkg from './package.json'
import { terser } from 'rollup-plugin-terser'

export default [
  // browser-friendly UMD build
  {
    input: 'src/index.js',
    output: {
      name: 'easylog',
      format: 'umd',
      file: pkg.browser,
    },
    watch: {
      include: 'src/**',
    },
    plugins: [
      resolve(), // so Rollup can find npm modules
      babel({
        exclude: 'node_modules/**', // only transpile our source code
        babelrc: false,
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                browsers: ['last 1 version', '> 1%', 'IE 6'],
              },
              loose: true,
              modules: false,
              useBuiltIns: false,
              debug: true,
            },
          ],
        ],
      }),
      commonjs(), // so Rollup can convert `ms` to an ES module
      terser(),
    ],
    external: ['axios'],
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
  //     include: 'src/**',
  //   },
  //   output: [
  //     { file: pkg.main, format: 'cjs' },
  //     { file: pkg.module, format: 'es' },
  //   ],
  // },
]
