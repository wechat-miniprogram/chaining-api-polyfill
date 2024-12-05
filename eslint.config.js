const js = require('@eslint/js')
const tseslint = require('typescript-eslint')
const importPlugin = require('eslint-plugin-import')
const prettierRecommended = require('eslint-plugin-prettier/recommended')
const promise = require('eslint-plugin-promise')

module.exports = tseslint.config({
  files: ["src/**/*.[jt]s", "dist/**/*.[jt]s"],
  extends: [
    js.configs.recommended,
    importPlugin.flatConfigs.recommended,
    promise.configs['flat/recommended'],
    prettierRecommended,
    tseslint.configs.recommended,
  ],
})
