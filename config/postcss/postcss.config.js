import path from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const tailwindConfig = path.resolve(configDir, '../tailwind/tailwind.config.js');

export default {
  plugins: {
    '@tailwindcss/postcss': { config: tailwindConfig },
    autoprefixer: {},
  },
};
