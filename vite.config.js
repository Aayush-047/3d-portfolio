import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    modulePreload: false,
    sourcemap: false,
    target: 'es2020',
    cssCodeSplit: true,
    reportCompressedSize: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1500, // ← three.js chunks are large, avoids noise
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('vite/preload-helper')) return 'preload-helper';
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('@react-three/fiber') || id.includes('@react-three/drei'))
            return 'vendor-r3f';

          if (id.includes('three')) return 'vendor-three';
          // ← split react and react-dom separately, react-dom is huge
          if (id.includes('react-dom')) return 'vendor-react-dom';
          if (id.includes('react')) return 'vendor-react';

          return undefined;
        },
      },
    },
  },
  // ← add this: faster dev server, avoids pre-bundling mismatches
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
    ],
  },
});
