import { defineConfig } from 'vite'
import path from 'node:path'

// eslint-disable-next-line import/no-unresolved
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config
export default defineConfig({
    resolve: {
        alias: {
            '@preload': path.resolve(__dirname, 'src', 'preload'),
            '@renderer': path.resolve(__dirname, 'src', 'renderer')
        }
    },
    plugins: [tailwindcss()]
})
