module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: ["google", "prettier"],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    // { a, b } instead of {a, b}
    "object-curly-spacing": ["error", "always"],
    // 2 spaces instead of 4
    indent: [
      "error",
      2,
      {
        // Switch case indent
        SwitchCase: 1,
      },
    ],
  },
};
