// ESLint: empfohlene Regeln; App-Dateien sind klassische Skripte im Browser mit dem Namensraum PP
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['src/**/*.js', 'tests/tests.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'script', globals: { ...globals.browser, PP: 'writable' } },
  },
  {
    files: ['scripts/**/*.js', 'tests/run.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'commonjs', globals: { ...globals.node, PP: 'readonly' } },
  },
  { rules: { 'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }] } },
  // Validierter Rechenkern: ein überflüssiges try/catch in parseEquation ist harmlos und bleibt bewusst unverändert
  { files: ['src/core/engine.js'], rules: { 'no-useless-catch': 'off' } },
];
