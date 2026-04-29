import path from 'path';
import checker from 'vite-plugin-checker';
import { loadEnv, defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
// ----------------------------------------------------------------------
var PORT = 3000;
var env = loadEnv('all', process.cwd());
export default defineConfig({
    // base: env.VITE_BASE_PATH,
    plugins: [
        react(),
        checker({
            typescript: true,
            eslint: false,
            overlay: false,
        }),
    ],
    resolve: {
        alias: [
            {
                find: /^~(.+)/,
                replacement: path.join(process.cwd(), 'node_modules/$1'),
            },
            {
                find: /^src(.+)/,
                replacement: path.join(process.cwd(), 'src/$1'),
            },
        ],
    },
    server: { port: PORT, host: true },
    preview: { port: PORT, host: true },
});
