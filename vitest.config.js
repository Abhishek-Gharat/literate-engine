import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.test.{js,jsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      // Exclude files that use Node's native test runner
      'src/analysis/*.test.js',
      'src/services/analysisApi.test.js',
      'src/utils/graphAdapter.test.js',
    ],
    setupFiles: ['./src/test-setup.js'],
  },
})
