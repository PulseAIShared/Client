/// <reference types="vite/client" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs';
import process from 'process';

// Determine if we're building for production
const isProduction = process.env.NODE_ENV === 'production';

// Only set up HTTPS for development
const serverConfig = isProduction 
  ? { port: 3000 } 
  : {
      port: 3000,
      https: {
        key: fs.readFileSync('localhost+1-key.pem'),
        cert: fs.readFileSync('localhost+1.pem'),
      },
    };

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