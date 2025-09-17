const { defineConfig } = require('vite');
const path = require('path');

module.exports = defineConfig({
  root: '.',
  resolve: {
    alias: {
      jquery: path.resolve(__dirname, 'node_modules/jquery/dist/jquery.js')
    }
  },
  server: {
    open: '/demo/index.html'
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    globals: true,
    restoreMocks: true
  }
});
