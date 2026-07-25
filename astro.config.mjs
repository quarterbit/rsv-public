// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages mit Custom Domain: Seite liegt am Domain-Root,
// daher KEIN base-Prefix (siehe .github/instructions/github-pages-deployment.instructions.md)
export default defineConfig({
  site: 'https://radschnellverbindung-tennenlohe.de',
});
