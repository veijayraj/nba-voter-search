import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // This uses the repo name on GH, but '/' on your local machine
  base: process.env.NODE_ENV === 'production' ? '/your-repo-name/' : '/',
})
