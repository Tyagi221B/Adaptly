import type { Config } from 'jest'
import nextJest from 'next/jest'

// Provide the path to your Next.js app to load next.config.js and .env files
const createJestConfig = nextJest({
  dir: './',
})

// Custom Jest configuration
const config: Config = {
  // Use jsdom for testing (simulates browser)
  testEnvironment: 'jsdom',

  // Setup files to run before each test
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Where to find test files
  testMatch: [
    '**/__tests__/**/*.{ts,tsx}',
    '**/*.{test,spec}.{ts,tsx}'
  ],

  // Coverage configuration (optional but impressive)
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'actions/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],

  // Module name mapper for path aliases (@/...)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

// Export config with Next.js settings
export default createJestConfig(config)
