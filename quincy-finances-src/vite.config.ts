import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/quincy-finances/',
  plugins: [react()],
  build: {
    target: 'esnext',
  },
});
