import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  base: import.meta.env.BASE_URL + '/NectAct-Ecom-front/',

  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
});
