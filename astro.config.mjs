// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://feelmyself.pl',
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
});
