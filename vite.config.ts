import { defineConfig } from 'vite'
import react from '@vitejs/react-package'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/HekticHub/',
  plugins: [react()],
})
