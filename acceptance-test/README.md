# Requirements for running Acceptance Tests
- Install dependencies:
```bash
  pnpm install
  pnpm exec playwright install msedge
```

# To run the tests
Run:
```bash
  pnpm exec playwright test
  # Runs the end-to-end tests.

  pnpm exec playwright test --ui
  # Starts the interactive UI mode.

  pnpm exec playwright test --project=chromium
  # Runs the tests only on Desktop Chrome.
  # For a list of other browsers, see 'projects' in playwright.config.ts file.

  pnpm exec playwright test example
  # Runs the tests in a specific file.

  pnpm exec playwright test --debug
  # Runs the tests in debug mode.

  pnpm exec playwright codegen
  # Auto generate tests with Codegen.
```

To open last HTML report run:
```bash
  pnpm exec playwright show-report
```
