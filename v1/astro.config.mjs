import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [
    react({
      experimentalReactChildren: true,
    }),
  ],
  output: 'static',
  adapter: {
    name: '@astrojs/cloudflare',
  },
  vite: {
    ssr: {
      external: ['@cloudflare/workers-types'],
    },
  },
});
