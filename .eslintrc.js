module.exports = {
  root: true,
  ignorePatterns: [
    'node_modules/**/*',
  ],
  env: {
    node: true,
  },

  extends: [
    '@bankai/eslint-config',
  ],

  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
  },
}
