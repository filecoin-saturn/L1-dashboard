module.exports = {
    parser: '@babel/eslint-parser',
    extends: ['react-app', 'standard', 'plugin:jsx-a11y/recommended'],
    plugins: ['jsx-a11y'],
    rules: {
        indent: ['error', 4]
    }
}
