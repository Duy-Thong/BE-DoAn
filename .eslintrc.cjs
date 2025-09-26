module.exports = {
    root: true,
    env: { node: true, es2022: true, jest: true },
    parser: '@typescript-eslint/parser',
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module', project: false },
    plugins: ['@typescript-eslint', 'import', 'unused-imports'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/recommended',
        'prettier',
    ],
    settings: { 'import/resolver': { node: { extensions: ['.js', '.ts'] } } },
    rules: {
        'no-console': 'warn',
        'import/no-unresolved': 'off',
        'import/extensions': 'off',
        'unused-imports/no-unused-imports': 'error',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
};

