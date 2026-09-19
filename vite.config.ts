import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Use '/mock-test/' for GitHub Actions (Pages), '/' for Vercel and local dev
  base: process.env.GITHUB_ACTIONS ? '/mock-test/' : '/',
  plugins: [react(), tailwindcss()],
})
