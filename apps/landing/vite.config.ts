import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Bundles the client and build-time renderer, including the workspace package's source exports. */
export default defineConfig({
    plugins: [react()],
    resolve: { dedupe: ['react', 'react-dom'] },
});
