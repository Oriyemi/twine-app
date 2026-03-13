import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    root:'assets',
    plugins: [
        tailwindcss(),
    ],
    build: {
        outDir: '../dist', // Moves the build output back to the main project folder
        emptyOutDir: true,
    }
})