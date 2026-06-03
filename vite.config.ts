import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

const entry = {
  index: resolve(__dirname, 'src/index.ts'),
  auth: resolve(__dirname, 'src/auth.ts'),
  'data-table': resolve(__dirname, 'src/data-table.ts'),
  'delete-confirm-dialog': resolve(__dirname, 'src/delete-confirm-dialog.ts'),
  'table-header': resolve(__dirname, 'src/table-header.ts'),
  'table-pagination': resolve(__dirname, 'src/table-pagination.ts'),
  'theme-switcher': resolve(__dirname, 'src/theme-switcher.ts'),
  'theme-switcher-content': resolve(__dirname, 'src/theme-switcher-content.ts'),
  'file-upload': resolve(__dirname, 'src/file-upload.ts'),
  'image-reader': resolve(__dirname, 'src/image-reader.ts'),
  'video-reader': resolve(__dirname, 'src/video-reader.ts'),
  'simple-pdf-reader': resolve(__dirname, 'src/simple-pdf-reader.ts'),
  'pdf-reader': resolve(__dirname, 'src/pdf-reader.ts'),
  'pdf-sidebar': resolve(__dirname, 'src/pdf-sidebar.ts'),
  'markdown-reader': resolve(__dirname, 'src/markdown-reader.ts'),
  utils: resolve(__dirname, 'src/utils.ts'),
  'component-types': resolve(__dirname, 'src/component-types.ts'),
};

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.test.tsx', 'src/**/*.stories.tsx'],
    }),
  ],
  build: {
    lib: {
      entry,
      name: 'AtomixCommonUI',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        format === 'es' ? `${entryName}.js` : `${entryName}.cjs`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-label',
        '@radix-ui/react-select',
        '@radix-ui/react-slot',
        'class-variance-authority',
        'clsx',
        'lucide-react',
        'pdfjs-dist',
        'react-markdown',
        'react-pdf',
        'remark-gfm',
        'tailwind-merge',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
    emptyOutDir: true,
  },
});
