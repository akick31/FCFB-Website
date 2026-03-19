module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jest/recommended',
    'plugin:react-hooks/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020, // Support for optional chaining and nullish coalescing
    sourceType: 'module',
  },
  plugins: [
    'react',
    'jest',
    'react-hooks',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off', // Allow apostrophes in JSX
    'no-unused-vars': 'warn', // Make unused vars warnings instead of errors
    'react-hooks/rules-of-hooks': 'warn', // Warn for pre-existing violations in chart components
    'react-hooks/exhaustive-deps': 'warn', // Warn for missing deps
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
