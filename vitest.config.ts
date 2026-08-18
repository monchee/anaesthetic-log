import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify('0.0.0-test'),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 76,
        branches: 67,
        functions: 67,
        lines: 79,
        'src/features/testing/**/*.{ts,tsx}': {
          statements: 69,
          branches: 69,
          functions: 57,
          lines: 73,
        },
        'src/shared/utils/csvUtils.ts': {
          statements: 79,
          branches: 66,
          functions: 81,
          lines: 82,
        },
      },
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/types.ts',
        'dist/',
        '.wrangler/',
      ],
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'components/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '@features': resolve(__dirname, './src/features'),
      '@shared': resolve(__dirname, './src/shared'),
      '@core': resolve(__dirname, './src/core'),
    },
  },
});
