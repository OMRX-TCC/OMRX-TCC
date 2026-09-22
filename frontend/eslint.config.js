import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default [
  { ignores: ["node_modules/", "dist/"] },
  js.configs.recommended,
  prettier,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser },
    },
    rules: {
      eqeqeq: "error",
      "no-unused-vars": "warn",
    },
  },
];
