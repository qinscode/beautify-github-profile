import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  test: {
    // Enable global test APIs (describe, it, expect, etc.)
    globals: true,

    // Test environment
    environment: 'jsdom',

    // Setup files to run before each test file
    setupFiles: ['./tests/setup.ts'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],

      // Files to exclude from coverage
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/*.spec.tsx',
        '**/*.test.tsx',
        '**/*.config.ts',
        '**/*.config.js',
        '**/dist/**',
        '**/.storybook/**',
        '**/coverage/**',
        '**/playwright-report/**',
      ],

      // Coverage thresholds
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 85,
        lines: 80,
      },

      // Include source files for coverage
      include: ['src/**/*.{ts,tsx,js,jsx}'],
    },

    // Test file patterns
    include: [
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],

    // Files to exclude
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
      'build',
      'e2e',
      '.storybook',
    ],

    // Test timeout (30 seconds)
    testTimeout: 30000,

    // Hook timeout (10 seconds)
    hookTimeout: 10000,

    // Number of retry attempts for failed tests
    retry: process.env.CI ? 2 : 0,

    // Reporters
    reporters: process.env.CI
      ? ['verbose', 'json', 'junit']
      : ['verbose'],

    // Output options
    outputFile: {
      json: './test-results/vitest-results.json',
      junit: './test-results/vitest-junit.xml',
    },
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@store': path.resolve(__dirname, './src/store'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },

  // Define configuration
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'http://localhost:3000'
    ),
  },
})
