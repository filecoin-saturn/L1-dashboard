module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "plugin:@typescript-eslint/recommended",
    "react-app",
    "standard",
    "plugin:jsx-a11y/recommended",
    "prettier",
  ],
  plugins: ["@typescript-eslint", "jsx-a11y"],
  rules: {
    "jsx-a11y/no-autofocus": "off",
  },
  globals: {
    cl: true,
  },
  // https://github.com/eslint/typescript-eslint-parser/issues/437#issuecomment-435526531
  overrides: [
    {
      files: ["**/*.ts"],
      parser: "@typescript-eslint/parser",
      rules: {
        "no-undef": "off",
        "no-unused-vars": "off",
      },
    },
  ],
};
