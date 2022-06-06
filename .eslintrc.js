module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'plugin:@typescript-eslint/recommended',
        'react-app',
        'standard',
        'plugin:jsx-a11y/recommended'
    ],
    plugins: ['@typescript-eslint', 'jsx-a11y'],
    rules: {
        indent: ['error', 4]
    }
}
