import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    // Next.js supplies 'server-only' in its own build; in tests it is a no-op stub.
    '^server-only$': '<rootDir>/__tests__/stubs/server-only.ts',
    '^@/(.*)$': '<rootDir>/$1',
  },
  // ts-jest: use the project tsconfig but override module so Jest can import ESM-style code
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
        moduleResolution: 'node',
      },
    }],
  },
};

export default config;
