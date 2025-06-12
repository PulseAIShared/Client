/// <reference types="vite/client" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import * as fs from 'fs';

// Determine if we're building for production
const isProduction = process.env.NODE_ENV === 'production';

let serverConfig: any = { port: 3000 };
if (!isProduction) {
  serverConfig = {
    port: 3000,
    https: {
      key: fs.readFileSync('localhost+1-key.pem'),
      cert: fs.readFileSync('localhost+1.pem'),
    },
  };
}


export default defineConfig({
  base: '/', // Changed from './' to '/'
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: serverConfig,
  preview: {
    port: 3000,
  },
  optimizeDeps: { exclude: ['fsevents'] },
  build: {
    rollupOptions: {
      external: ['fs', 'fs/promises'],
      output: {
        experimentalMinChunkSize: 3500,
      },
    },
  },
});