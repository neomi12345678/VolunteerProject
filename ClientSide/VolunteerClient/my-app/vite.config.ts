import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7222', // כתובת ה-API שלך
        changeOrigin: true,
        secure: false, // אם ה-API משתמש ב-self-signed certificate
      },
    },
  },
});
