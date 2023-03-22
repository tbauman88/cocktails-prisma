/* eslint-disable */
export default {
  displayName: 'api',
  preset: '../../jest.preset.js',
  verbose: true,
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api',
  coverageReporters: ['clover', 'json', 'lcov', ['text', { skipFull: true }]]
}
