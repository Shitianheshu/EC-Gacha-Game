import path from 'node:path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config
export default defineConfig({
    resolve: {
        alias: {
            '@preload': path.resolve(__dirname, 'src', 'preload'),
            '@main': path.resolve(__dirname, 'src', 'main')
        }
    },
    build: {
        rollupOptions: {
            external: ['sharp']
        }
    }
})
