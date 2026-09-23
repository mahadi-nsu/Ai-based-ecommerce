/** @type {import("jest").Config} */
const config = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.json"
      }
    ]
  },
  collectCoverageFrom: ["src/**/*.(t|j)s"],
  coverageDirectory: "coverage",
  testEnvironment: "node",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@app/(.*)\\.js$": "<rootDir>/src/$1",
    "^@app/(.*)$": "<rootDir>/src/$1",
    "^@test/(.*)\\.js$": "<rootDir>/test/$1",
    "^@test/(.*)$": "<rootDir>/test/$1"
  }
};

module.exports = config;
