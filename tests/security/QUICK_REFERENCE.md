# Security Testing Quick Reference

## Essential Commands

| Command | Purpose | Time |
|---------|---------|------|
| `npm run test:security` | Run all unit tests (SAFEST - no DB) | 10s |
| `npm run test:ui` | Interactive test dashboard | - |
| `npm run test:e2e` | End-to-end browser tests | 60s+ |
| `npm run security:full` | All tests + vulnerability scan | 2min |
| `npm run security:scan` | Check npm dependencies | 30s |
| `npm run lint` | ESLint security checks | 5s |

## Pre-Commit Checklist

```bash
npm run test:security   # Must pass
npm run lint           # No errors
npm audit              # Check dependencies
```

## File Structure

```
tests/
├── security/
│   ├── auth.test.ts                    # 50+ unit tests
│   ├── client-side.test.ts             # 10+ client tests
│   ├── QUICK_REFERENCE.md              # Commands (you are here)
│   ├── TEST_EXPLANATIONS.md            # What each test does
├── e2e/
│   └── security.spec.ts                # 25+ E2E tests
└── setup.ts                            # Mock data & config
```

## Test Breakdown

### Unit Tests (50+)
- **SQL Injection:** Prevents `' OR '1'='1` style attacks
- **XSS:** Stops `<script>alert()</script>` execution
- **Input Validation:** Handles empty, null, long, special chars
- **Authorization:** Verifies data isolation by event/user
- **Client-Side:** LocalStorage, session, store security

**→ See [TEST_EXPLANATIONS.md](./TEST_EXPLANATIONS.md) for details**

### E2E Tests (25+)
- **Real browser login tests** with attack attempts
- **Session persistence** across page reloads
- **Protected route access** prevention
- **Network security** (HTTPS, console logs)
- **DoS resistance** (rapid requests, huge payloads)

## Debug Commands

```bash
# Single test file (verbose output)
npm run test:security auth.test.ts -- --reporter=verbose

# Watch mode (re-runs on file change)
npm run test:security -- --watch

# Coverage report
npm run test:security -- --coverage

# E2E debug (opens inspector)
npm run test:e2e -- --debug
```

## First Time Setup

```bash
# 1. Install
npm install

# 2. Run unit tests (safe, no DB)
npm run test:security

# 3. View in dashboard
npm run test:ui

# 4. Read explanations
cat tests/security/TEST_EXPLANATIONS.md
```

## Success Indicators

| Check | Command | Expected |
|-------|---------|----------|
| All tests pass | `npm run test:security` | ✅ Green |
| No lint errors | `npm run lint` | ✅ Clean |
| No npm vulns | `npm audit` | ✅ 0 critical |
| Coverage good | `npm run test:security -- --coverage` | ✅ >80% |

## Documentation Map

| File | Purpose |
|------|---------|
| **QUICK_REFERENCE.md** | Commands & overview (you are here) |
| **TEST_EXPLANATIONS.md** | What each test does in plain English |
| **SECURITY_TEST_PLAN.md** | Full testing strategy (8 categories) |
| **TESTING_GUIDE.md** | How to run, interpret, fix tests |
| **README.md** | Complete setup & architecture |

## Troubleshooting

```bash
# Tests won't run?
npm install && npm run test:security

# Need Node 18+?
node --version

# E2E tests broken?
npx playwright install --with-deps

# Slow tests?
Normal - mocks run ~10s, E2E tests run ~60s
```

## Quick Links

- **Attack Payloads:** See TEST_EXPLANATIONS.md
- **Test Strategy:** See SECURITY_TEST_PLAN.md
- **Run Instructions:** See TESTING_GUIDE.md
- **Full Details:** See README.md

---

Start here: `npm run test:security` - it's safe, fast, and tells you everything!
