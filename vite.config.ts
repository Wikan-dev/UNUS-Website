import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    // ============================================================
    // PROXY: meneruskan permintaan data dari React ke server PHP
    // ============================================================
    // Kenapa perlu?
    //   Backend PHP jalan di port 8080, React di port 5173.
    //   Tanpa proxy, browser memblokir permintaan lintas origin (CORS).
    //   Dengan proxy, React cukup menulis fetch('/api.php?...')
    //   dan Vite meneruskannya ke http://localhost:8080/api.php
    //   sehingga browser tidak menganggapnya cross-origin.
    //
    // Syarat: server PHP harus jalan lebih dulu:
    //     php -S localhost:8080 -t backend
    // ============================================================
    proxy: {
      '/api.php': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
