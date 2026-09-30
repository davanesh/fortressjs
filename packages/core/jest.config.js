module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.test.json"
      }
    ]
  },
  testMatch: [
    "**/src/**/*.spec.ts",
    "**/src/**/*.test.ts"
  ],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: [
    "text",
    "lcov"
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};