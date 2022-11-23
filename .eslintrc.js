module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // quotes: "error"
    quotes: [2, 'single'],
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-empty-function': 0
  },
  // 忽略校验文件
  ignorePatterns: [
    'lib',
    'coverage',
    '.husky',
    'node_modules',
    'example',
    'packages/vue/dist'
  ]
}
