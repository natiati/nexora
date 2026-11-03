import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Al ejecutar npm run dev se abre el navegador en la landing
  server: { open: '/' },
})
