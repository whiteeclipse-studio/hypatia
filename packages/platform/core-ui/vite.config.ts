import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** ES module library build that leaves React and Radix to the consuming application. */
export default defineConfig({
    plugins: [react()],
    build: {
        lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'index' },
        rollupOptions: {
            // Consumers provide React and Radix; do not bundle duplicate instances.
            external: (id) => /^(react|react-dom|radix-ui|@radix-ui\/themes|@radix-ui\/react-toggle)(\/|$)/.test(id),
        },
    },
});
