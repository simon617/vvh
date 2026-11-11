// ESLint flat config (Next.js 16).
//
// Next.js 16 removed `next lint`, so linting now runs through the ESLint CLI
// (`npm run lint` → `eslint .`) against this flat config instead of the old
// `.eslintrc.json` that extended `next/core-web-vitals`.
//
// `eslint-config-next/core-web-vitals` already exports a flat config *array*
// that bundles everything the previous eslintrc preset provided:
//   - block 1: base JS/JSX parser (next/babel) + react, react-hooks,
//     @next/next and jsx-a11y rules + the shared import resolvers
//   - block 2: TypeScript parser (@typescript-eslint/parser) for **/*.ts{,x}
//   - block 3: global ignores for .next/**, out/**, build/**, next-env.d.ts
//     (node_modules/ and .git/ are ignored by ESLint by default)
// so no separate `eslint-config-next/typescript` import is required here.
import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    rules: {
      // `react-hooks/set-state-in-effect` is new in eslint-plugin-react-hooks v7
      // (pulled in by eslint-config-next@16) and ships as an *error* in that
      // plugin's recommended set. The two flagged call sites in
      // `src/components/layout/ReportsTable.tsx` are deliberate:
      //   * :81 clamps `page` to `safePage` when the row count shrinks
      //   * :91 restores `?page=N` on load; the inline comment explains it is
      //     read inside an effect (not a `useState` initialiser) on purpose, to
      //     avoid an SSR/client hydration mismatch
      // Kept as a warning so the refactor stays on the radar without failing
      // lint on an unrelated framework bump.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    // Generated / non-source directories that `next lint` never looked at and
    // that must not be linted now that the scope is the whole project.
    ignores: [
      "coverage/**",
      "prisma/data/**",
      "uploads/**",
      "*.tsbuildinfo",
    ],
  },
];

export default config;
