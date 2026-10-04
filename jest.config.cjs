const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['**/*.test.[jt]s?(x)'],
  testPathIgnorePatterns: ['[\\\\/]node_modules[\\\\/]', '[\\\\/]tests[\\\\/]', '[\\\\/]test-utils[\\\\/]'],
};

module.exports = createJestConfig(customJestConfig);
