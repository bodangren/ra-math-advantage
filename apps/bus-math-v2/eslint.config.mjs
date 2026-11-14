const eslintConfig = [
  {
    ignores: [
      "**/.next/**",
      "node_modules/**",
      "dist/**",
      "convex/_generated/**",
      "playwright-report/**",
    ],
  },
  {
    settings: {
      react: { version: "19" },
    },
  },
];

export default eslintConfig;
