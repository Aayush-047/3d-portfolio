import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-remove-properties', { properties: ['data-testid'] }], // strip test attrs in prod
        ],
      },
    }),
  ],
  build: {
    sourcemap: false,
    target: 'es2020',
    cssCodeSplit: true,
    reportCompressedSize: true,
    minify: 'terser', // ← better minification than default esbuild
    terserOptions: {
      compress: {
        drop_console: true, // ← removes all console.log in prod
        drop_debugger: true,
        pure_funcs: ['console.info', 'console.debug', 'console.warn'],
      },
    },
    chunkSizeWarningLimit: 1500, // ← three.js chunks are large, avoids noise
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('@react-three/fiber') || id.includes('@react-three/drei'))
            return 'vendor-r3f';

          if (id.includes('three')) return 'vendor-three';
          if (id.includes('gsap')) return 'vendor-gsap';
          if (id.includes('framer-motion')) return 'vendor-motion';

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
      'gsap',
      'framer-motion',
    ],
  },
});
