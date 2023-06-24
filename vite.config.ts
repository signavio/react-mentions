import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import svgrPlugin from 'vite-plugin-svgr'
import path from 'path'
import pkg from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      formats: ['es', 'cjs'],
      fileName: (format) =>
        format === 'es' ? 'react-mentions.esm.js' : 'react-mentions.cjs.js',
    },
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      external: Object.keys(pkg.peerDependencies),
    },
  },
  plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
  // esbuild: {
  //   loader: 'jsx',
  //   include: /src\/.*\.jsx?$/,
  //   // loader: "tsx",
  //   // include: /src\/.*\.[tj]sx?$/,
  //   exclude: [],
  // },
  // optimizeDeps: {
  //   esbuildOptions: {
  //     plugins: [
  //       {
  //         name: 'load-js-files-as-jsx',
  //         setup(build) {
  //           build.onLoad({ filter: /src\/.*\.js$/ }, async (args) => ({
  //             loader: 'jsx',
  //             contents: await fs.readFile(args.path, 'utf8'),
  //           }))
  //         },
  //       },
  //     ],
  //   },
  // },
})
