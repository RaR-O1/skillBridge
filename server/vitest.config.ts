import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    hookTimeout: 120000, // Allow time for first-time binary download
    testTimeout: 60000,
    globals: true,
  },
});
