module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testMatch: [
        '**/tests/**/*.test.js'
    ],
    collectCoverageFrom: [
        'server.js',
        'controllers/**/*.js',
        'models/**/*.js',
        'routes/**/*.js',
        'middleware/**/*.js',
        'utils/**/*.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    verbose: true,
    testTimeout: 30000,
    // Handle ES modules and Node.js 20.x compatibility
    transformIgnorePatterns: [
        'node_modules/(?!(@vercel/analytics)/)'
    ],
    // Mock Vercel Analytics for tests
    moduleNameMapper: {
        '^@vercel/analytics/server$': '<rootDir>/tests/mocks/vercel-analytics.mock.js'
    },
    // Ensure compatibility with Node.js 20.x
    globals: {
        'ts-jest': {
            useESM: true
        }
    }
};
