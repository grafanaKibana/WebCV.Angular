const { createEsmPreset } = require('jest-preset-angular/presets');

const preset = createEsmPreset({
  tsconfig: '<rootDir>/tsconfig.spec.json',
  stringifyContentPathRegex: '\\.(html|svg)$'
});

module.exports = {
  ...preset,
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  moduleNameMapper: {
    ...preset.moduleNameMapper,
    '^rxjs$': '<rootDir>/node_modules/rxjs/dist/cjs/index.js',
    '^rxjs/(.*)$': '<rootDir>/node_modules/rxjs/dist/cjs/$1'
  }
};
