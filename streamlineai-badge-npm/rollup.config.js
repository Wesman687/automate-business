import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default [
  // ES Module build
  {
    input: 'src/index.tsx',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      exports: 'named'
    },
    external: ['react'],
    plugins: [
      resolve(),
      typescript({
        declaration: true,
        declarationDir: 'dist',
        rootDir: 'src'
      })
    ]
  },
  // CommonJS build
  {
    input: 'src/index.tsx',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'named'
    },
    external: ['react'],
    plugins: [
      resolve(),
      typescript({
        declaration: false
      })
    ]
  }
];
