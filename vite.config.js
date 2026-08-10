import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ isSsrBuild }) => ({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            '/api/v1/arceus': {
                target: process.env.VITE_DEV_PROXY_TARGET || 'https://api.fakecollegefootball.com',
                changeOrigin: true,
                headers: { 'X-Service-Key': process.env.WEBSITE_SERVICE_KEY || '' },
            },
        },
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
