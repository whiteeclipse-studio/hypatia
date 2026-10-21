import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Vite configuration for the React Storybook application. */
export default defineConfig({
    plugins: [react()],
    resolve: { dedupe: ['react', 'react-dom'] },
});
