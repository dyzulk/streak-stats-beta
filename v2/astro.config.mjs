import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    mode: 'advanced', // Switch to Cloudflare Workers (Advanced Mode)
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [
    react(),
  ],
  vite: {
    ssr: {
      noExternal: true,
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    plugins: [tailwindcss()],
  },
});