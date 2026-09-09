import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { adminDevPlugin } from './vite-plugin-admin-dev.mjs';

// GitHub Pages project sites need a base path (e.g. /counselling-website-template).
// deploy-pages.yml sets these from actions/configure-pages outputs.
const site = process.env.ASTRO_SITE_URL || 'https://example.com';
const configuredBase = process.env.ASTRO_BASE_PATH || '/';
const base = configuredBase === '/' ? '/' : configuredBase.replace(/\/$/, '');

export default defineConfig({
  site,
  base,
  integrations: [react()],
  vite: {
    plugins: [tailwindcss(), adminDevPlugin()],
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
  },
});
