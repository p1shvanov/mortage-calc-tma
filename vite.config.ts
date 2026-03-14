import { readFileSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react-swc';
import mkcert from 'vite-plugin-mkcert';
import { visualizer } from 'rollup-plugin-visualizer';

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));

// https://vitejs.dev/config/
export default defineConfig({
  base: '/mortage-calc-tma/',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: true,
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
      },
    },
  },
  plugins: [
    // Allows using React dev server along with building a React application with Vite.
    // https://npmjs.com/package/@vitejs/plugin-react-swc
    react(),
    // Allows using the compilerOptions.paths property in tsconfig.json.
    // https://www.npmjs.com/package/vite-tsconfig-paths
    tsconfigPaths(),
    // Creates a custom SSL certificate valid for the local machine.
    // Using this plugin requires admin rights on the first dev-mode launch.
    // https://www.npmjs.com/package/vite-plugin-mkcert
    process.env.HTTPS ? mkcert() : null,
    // Visualize bundle size
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-telegram': ['@telegram-apps/sdk-react', '@telegram-apps/telegram-ui'],
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          'vendor-forms': ['@tanstack/react-form', 'zod', '@react-input/number-format'],
        },
      },
    },
    sourcemap: false, // Set to true when debugging production issues
    // Minify the output
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Smaller bundle, no debug leaks in production
        drop_debugger: true,
      },
    },
  },
  publicDir: './public',
  server: {
    // Exposes your dev server and makes it accessible for the devices in the same network.
    host: true,
  },
});
