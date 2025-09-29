import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  assetsInclude: ['**/*.ttf', '**/*.otf'],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'img';
          }
          if (/ttf|otf|woff|woff2/i.test(extType)) {
            extType = 'fonts';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
      },
    },
  },
});
