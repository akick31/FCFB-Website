module.exports = {
    transform: {
        '^.+\\.(js|jsx|mjs|cjs)$': 'babel-jest',
    },
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'jsx', 'mjs', 'json', 'node'],
};
