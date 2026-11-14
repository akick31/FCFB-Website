module.exports = {
    transform: {
        '^.+\\.(js|jsx|mjs|cjs)$': 'babel-jest',
    },
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'jsx', 'mjs', 'json', 'node'],
    moduleNameMapper: {
        '^(\\.{1,2}/)+config/api$': '<rootDir>/src/testUtils/stubs/apiConfig.js',
        '\\.(png|jpe?g|gif|svg|webp)$': '<rootDir>/src/testUtils/stubs/fileStub.js',
    },
};
