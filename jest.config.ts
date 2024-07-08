/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type {Config} from 'jest';

const config: Config = {
  modulePaths: ['./tests'],
  moduleNameMapper: {
    '^@root/(.*)$': '<rootDir>/$1',
    '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
    '^@functions/(.*)$': '<rootDir>/src/functions/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@interfaces/(.*)$': '<rootDir>/src/interfaces/$1',
    '^@libs/(.*)$': '<rootDir>/src/libs/$1',
    '^@schemas/(.*)$': '<rootDir>/src/schemas/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@contents/(.*)$': '<rootDir>/src/contents/$1',
    '^@events/(.*)$': '<rootDir>/src/events/$1',
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
  },
  clearMocks: true,
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-node',
  transform: {},
  collectCoverage: true,
  cache: true,
  silent: false,
};

export default config;
