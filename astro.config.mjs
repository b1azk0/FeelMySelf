// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import { remarkResolveImages } from './src/lib/images.ts';

export default defineConfig({
  site: 'https://www.feelmyself.pl',
  output: 'static',
  trailingSlash: 'never',

  i18n: {
    defaultLocale: 'pl',
    locales: ['pl'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  build: {
    format: 'directory',
  },

  markdown: {
    remarkPlugins: [remarkResolveImages],
  },

  vite: {
    plugins: [tailwindcss()],
  },
});