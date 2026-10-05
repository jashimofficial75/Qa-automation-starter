# QA Automation Starter

Playwright + TypeScript starter for **UI E2E, API and security** testing. You can copy it into any project and run it straight away. It ships pointed at two public demo apps, [saucedemo.com](https://www.saucedemo.com) (UI) and [dummyjson.com](https://dummyjson.com) (API), so the whole suite passes before you change anything.

## Quick start

```bash
npm ci
npx playwright install --with-deps
npm test                # everything
npm run report          # open the HTML report
```

| Command                          | What it runs                                         |
| -------------------------------- | ---------------------------------------------------- |
| `npm run test:smoke`             | Only tests tagged `@smoke` (critical paths, ~10s)    |
| `npm run test:e2e`               | Browser tests (Chromium)                             |
| `npm run test:api`               | API tests (no browser, fast)                         |
| `npm run test:security`          | Auth/JWT, security headers, injection and XSS checks |
| `npm run test:cross-browser`     | Adds Firefox + WebKit                                |
| `npm run test:flaky-check`       | Runs every test 5× in parallel to find flaky tests   |
| `npm run test:ui` / `test:debug` | Playwright UI mode / step-through debugger           |
| `npm run check`                  | Type check + lint + format check (also run in CI)    |

## Adapting it to a new project (about 15 minutes)

1. **Configure:** `cp .env.example .env` and set `BASE_URL`, `API_URL`, credentials and `TEST_ID_ATTRIBUTE`. For several environments, create `.env.staging` and run with `TEST_ENV=staging npm test`.
2. **Pages:** copy `src/pages/LoginPage.ts` for each screen you test. Put locators and actions in the page object and keep assertions in the tests.
3. **Login once:** update `tests/setup/auth.setup.ts` for your login flow. Every E2E test reuses the saved session.
4. **API contracts:** replace the schemas in `src/api/schemas.ts` with your real response shapes.
5. **Security:** set `PROTECTED` in `tests/security/api-auth.spec.ts` to one of your protected endpoints, and tune the header lists in `src/data/security-payloads.ts`.
6. **Delete the demo specs** once your own specs replace them. Also delete the `isDemoApi` known-issue flags.
7. **CI:** add the repo variables `BASE_URL` and `API_URL`, plus the secrets `UI_USERNAME`, `UI_PASSWORD`, `API_USERNAME` and `API_PASSWORD`.

## Structure

```
├── playwright.config.ts        # projects: setup · e2e-* · api · security
├── src/
│   ├── config/env.ts           # typed + validated env (fails fast on bad config)
│   ├── fixtures/index.ts       # custom `test`: page objects, api clients, worker-scoped token
│   ├── pages/                  # Page Object Model (BasePage, LoginPage, InventoryPage)
│   ├── api/                    # ApiClient wrapper + zod response schemas
│   └── data/                   # factories (unique data per test) + security payloads
├── tests/
│   ├── setup/auth.setup.ts     # log in once → playwright/.auth/user.json
│   ├── e2e/                    # user journeys
│   ├── api/                    # status, schema, pagination, errors
│   └── security/               # broken auth, JWT tampering, headers, SQLi/XSS
└── .github/workflows/playwright.yml   # quality lane + sharded E2E + merged report
```

Always import `test` and `expect` from `src/fixtures`, not from `@playwright/test`.

## Built-in best practices

- **Stable locators.** Use role, label or placeholder first, then the test id, and CSS only as a last resort.
- **No sleeps.** Use web-first assertions that retry automatically. ESLint blocks `waitForTimeout`.
- **Every test asserts.** ESLint enforces `expect-expect`. A stray `test.only` fails CI.
- **Deterministic tests.** Locale and timezone are fixed, every test builds its own data, and tests run in parallel with no ordering between them.
- **Fast authentication.** The UI logs in once through storage state, and the API logs in once per worker.
- **Contract checks.** API tests validate response shape with zod, not only the status code.
- **Debuggable failures.** Each failure keeps a trace, a screenshot and a video. In CI, retries mark a test as flaky in the report instead of hiding the problem.
- **Fast CI.** Pull requests run Chromium only. The nightly run covers the full browser matrix. E2E is sharded into 2 parts and the reports are merged into one HTML artifact.
- **Known bugs are tracked with `test.fail(condition, reason)`.** A known bug stays visible in the report. The test turns red as soon as the bug is fixed, so the flag gets removed.

## Writing a new test: checklist

- [ ] Would the test fail if the behavior broke? Confirm by temporarily breaking the code.
- [ ] Does it assert specific values, not just "truthy"?
- [ ] Does it cover edge and error cases, not only the happy path?
- [ ] Is it independent of other tests and free of sleeps?
- [ ] Does the name describe the requirement? Tag it `@smoke` only if it covers a critical path.

## Demo-app findings

The security suite found three real issues in the dummyjson demo. They are marked as expected failures, so the suite stays green against the demo:

- A tampered JWT signature gets **500** instead of 401.
- An `alg: none` token gets **500** instead of 401.
- `/auth/me` returns the user's **plain-text password**.

Run security tests only against systems you own or are authorized to test.
