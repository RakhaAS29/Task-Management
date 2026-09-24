import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // listen on 0.0.0.0, not just localhost — required so the container's port is reachable from your host machine
    port: 5173,
     },
});
