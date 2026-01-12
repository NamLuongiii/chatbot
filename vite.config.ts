import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
    base: './',
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                entryFileNames: 'index.js',
                assetFileNames: 'index.[ext]',
            },
        }
    },
    define: {
        // Add process.env and global polyfills for the browser environment
        'process.env': {},
        process: {
            env: {}
        },
        // Polyfill for the global variable
        global: {}
    },
})
