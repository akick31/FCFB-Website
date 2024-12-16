module.exports = {
    preset: 'react-app', // Uses the default react-scripts config
    transform: {
        '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': 'babel-jest', // Ensures Jest uses Babel to transform JS files
    },
    testEnvironment: 'jsdom', // Ensures tests run in a browser-like environment
    moduleFileExtensions: ['js', 'jsx', 'mjs', 'json', 'node'], // Ensure Jest handles mjs (ESM) files
};