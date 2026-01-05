import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default [
  {
    ignores: ["dist/**", "docs/**", "node_modules/**"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      parser: tsparser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      react: react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      import: importPlugin,
      "unused-imports": unusedImports,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // unused-imports/no-unused-vars との競合避けるためにoff
      "@typescript-eslint/no-unused-vars": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      // R3Fの一部のプロパティがunknownと判定されるためwarningにする
      // @see https://github.com/pmndrs/react-three-fiber/issues/2623
      "react/no-unknown-property": "warn",
      // 未使用のimportと変数の検出・削除
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      // 名前付きimport内のメンバーソート + 同一モジュールの構文順序制御
      "sort-imports": [
        "warn",
        {
          // 大文字小文字を区別しない
          ignoreCase: true,
          // import文同士の順序は、より高度に設定可能なimport/orderに任せるため、sort-importsでは制御しない
          ignoreDeclarationSort: true,
          // 名前付きimport内のメンバーソート
          ignoreMemberSort: false,
          // 同一モジュールの構文順序制御
          memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
        },
      ],
      // 異なるモジュール間のimport文の順序制御 + グループ分け
      "import/order": [
        "warn",
        {
          groups: [
            "builtin", // Node.jsの組み込みモジュール
            "external", // node_modulesのパッケージ
            "internal", // プロジェクト内の絶対パス
            "parent", // 親ディレクトリからの相対パス
            "sibling", // 同階層の相対パス
            "index", // index.js等
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            // 大文字小文字を区別しない
            caseInsensitive: true,
          },
        },
      ],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
