import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ isSsrBuild }) => ({
    plugins: [react()],
    server: {
        port: 3000,
    },
    build: {
        outDir: 'build',
        rollupOptions: isSsrBuild ? {} : {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
                    charts: ['recharts'],
                },
            },
        },
    },
    ssr: {
        noExternal: true,
    },
}));
