const js = require('@eslint/js')
const tseslint = require('typescript-eslint')
const importPlugin = require('eslint-plugin-import')
const prettierRecommended = require('eslint-plugin-prettier/recommended')
const promise = require('eslint-plugin-promise')

const tsconfig = tseslint.config({
  files: ["src/**/*.[jt]s", "dist/**/*.[jt]s"],
  extends: [
    js.configs.recommended,
    promise.configs['flat/recommended'],
    prettierRecommended,
    tseslint.configs.recommended,
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "warn",
  },
})

module.exports = [
  // importPlugin.flatConfigs.recommended,
  ...tsconfig,
]
