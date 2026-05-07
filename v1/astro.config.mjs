import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

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
      noExternal: ['lucide-react'],
    },

    plugins: [tailwindcss()],
  },
});