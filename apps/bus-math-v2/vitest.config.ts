import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: [
      '__tests__/**/*.test.{ts,tsx}',
    ],
    reporters: 'default'
  },
    resolve: {
      alias: [
          // vinext 1.x replaces the next package: tests resolve next/* through the vinext
          // runtime shims, the same mapping that vinext build uses
          // (vinext/shims/public-shim-map.json).
        
        { find: 'next/link', replacement: 'vinext/shims/link' },
        { find: 'next/head', replacement: 'vinext/shims/head' },
        { find: 'next/compat/router', replacement: 'vinext/shims/compat-router' },
        { find: 'next/router', replacement: 'vinext/shims/router' },
        { find: 'next/legacy/image', replacement: 'vinext/shims/legacy-image' },
        { find: 'next/image', replacement: 'vinext/shims/image' },
        { find: 'next/dynamic', replacement: 'vinext/shims/dynamic' },
        { find: 'next/app', replacement: 'vinext/shims/app' },
        { find: 'next/document', replacement: 'vinext/shims/document' },
        { find: 'next/config', replacement: 'vinext/shims/config' },
        { find: 'next/script', replacement: 'vinext/shims/script' },
        { find: 'next/server', replacement: 'vinext/shims/server' },
        { find: 'next/navigation', replacement: 'vinext/shims/navigation' },
        { find: 'next/headers', replacement: 'vinext/shims/headers' },
        { find: 'next/font/google', replacement: 'vinext/shims/font-google' },
        { find: 'next/font/local', replacement: 'vinext/shims/font-local' },
        { find: 'next/cache', replacement: 'vinext/shims/cache' },
        { find: 'next/form', replacement: 'vinext/shims/form' },
        { find: 'next/og', replacement: 'vinext/shims/og' },
        { find: 'next/web-vitals', replacement: 'vinext/shims/web-vitals' },
        { find: 'next/amp', replacement: 'vinext/shims/amp' },
        { find: 'next/offline', replacement: 'vinext/shims/offline' },
        { find: 'next/error', replacement: 'vinext/shims/error' },
        { find: 'next/constants', replacement: 'vinext/shims/constants' },
        // Stubs for Convex generated types — not present until `npx convex dev` is run.
        // Regex aliases match both absolute (@/convex/_generated/api) and relative
        // (./_generated/api) import forms used inside convex/*.ts source files.
        { find: /^.*\/_generated\/api$/, replacement: path.resolve(__dirname, './__stubs__/convex-generated-api.ts') },
        { find: /^.*\/_generated\/server$/, replacement: path.resolve(__dirname, './__stubs__/convex-generated-server.ts') },
        { find: '@', replacement: path.resolve(__dirname, './') },
      ]
  }
});
