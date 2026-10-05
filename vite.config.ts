import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
  build: {
    rolldownOptions: {
      output: {
        // Keep the large, rarely changing libraries in their own cacheable chunks.
        codeSplitting: {
          groups: [
            { name: 'charts', test: /node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/ },
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
            },
          ],
        },
      },
    },
  },
});
