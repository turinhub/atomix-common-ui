import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'playground',
  build: {
    outDir: '../playground-dist',
    emptyOutDir: true,
  },
  server: {
    fs: {
      allow: ['.'],
    },
  },
});
