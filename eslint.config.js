const js = require('@eslint/js');
const globals = require('globals');
const react = require('eslint-plugin-react');
const jest = require('eslint-plugin-jest');

module.exports = [
    {
        files: ['src/**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            parserOptions: { ecmaFeatures: { jsx: true } },
            globals: { ...globals.browser, ...globals.node, ...globals.jest },
        },
        plugins: { react, jest },
        rules: {
            ...js.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...jest.configs.recommended.rules,
            curly: ['error', 'all'],
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/no-unescaped-entities': 'off',
            'no-unused-vars': 'warn',
            'no-empty': ['error', { allowEmptyCatch: true }],
        },
        settings: { react: { version: 'detect' } },
    },
];
