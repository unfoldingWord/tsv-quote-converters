// jest.config.js
module.exports = {
  testMatch: ["<rootDir>/src/**/*.test.[jt]s?(x)"],
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },
  transformIgnorePatterns: [
    "/node_modules/"
  ]
};
