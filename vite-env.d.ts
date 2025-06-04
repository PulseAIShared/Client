// src/vite-env.d.ts (updated to fix environment variables)
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_API_URL: string
  readonly VITE_APP_APP_URL: string
  // Add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}