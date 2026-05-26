import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/quotes': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/quotes/, '/v7/finance/quote'),
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      },
    },
  },
})
