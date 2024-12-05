const path = require('path')

module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 9,
    sourceType: 'module',
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import', 'promise', 'prettier'],
  overrides: [
    {
      files: ['*.ts'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'eslint-config-prettier',
      ],
      parserOptions: {
        project: path.join(__dirname, 'tsconfig.json'),
      },
      rules: {},
    },
  ],
  extends: [
    'eslint:recommended',
    'plugin:promise/recommended',
    'eslint-config-prettier',
  ],
  env: {
    es6: true,
    jest: true,
  },
  rules: {},
}
