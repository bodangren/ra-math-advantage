import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
  { ignores: ['**/.next/**', '**/dist/**', '**/.convex/**', 'node_modules/**', 'convex/_generated/**', '**/coverage/**'] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    files: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
  { settings: { react: { version: '19' } } },
];

export default eslintConfig;
