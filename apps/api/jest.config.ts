import type { Config } from 'jest'

const config: Config = {
  displayName: 'api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  // coverageDirectory: '../../coverage/apps/api',
  // coverageReporters: ['clover', 'json', 'lcov', ['text', { skipFull: true }]],
  setupFilesAfterEnv: ['./jest.setup.ts']
}

export default config
