import type { Config } from 'jest'

const config: Config = {
  displayName: 'api',
  preset: '../../jest.preset.js',
  verbose: true,
  testEnvironment: 'node',
  testTimeout: 10000,
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api',
  coverageReporters: ['clover', 'json', 'lcov', ['text', { skipFull: true }]]
}

export default config
