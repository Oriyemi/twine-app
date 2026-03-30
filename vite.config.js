import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
    plugins: [
        tailwindcss(),
    ],
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                // Replace 'other' with the actual name of your second HTML file
                // and ensure the path points to where it lives (e.g., './wellness.html')
                product: resolve(__dirname, 'product.html'),
                customer: resolve(__dirname, 'customer.html'),
                blog: resolve(__dirname, 'blog.html'),
                pricing: resolve(__dirname, 'pricing.html'),
                product: resolve(__dirname, 'product.html'),
                
               
            },
        },
    },
})