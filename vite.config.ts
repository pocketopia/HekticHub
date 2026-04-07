import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // We changed this from '/HekticHub/' to '/' because you are using a custom domain
  base: '/', 
  plugins: [react()],
})
