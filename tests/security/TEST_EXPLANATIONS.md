# Security Test Explanations

Quick descriptions of what each test does and why it matters.

## Authentication Tests (`auth.test.ts`)

### SQL Injection Prevention (4 tests)
**What:** Tests if malicious SQL code in form inputs gets executed  
**Payloads:** `' OR '1'='1`, `'; DROP TABLE--`, `admin'--`  
**Why:** Attackers might try to break auth by injecting SQL commands  
**Expected:** All attempts fail gracefully, no DB damage  

### XSS Prevention (4 tests)
**What:** Tests if JavaScript can be injected via form inputs  
**Payloads:** `<script>alert()</script>`, `<img onerror=alert(1)>`, `javascript:alert()`  
**Why:** Attackers could steal session data if XSS works  
**Expected:** Scripts don't execute, inputs treated as plain text  

### Input Validation (6 tests)
**What:** Tests how app handles weird/invalid inputs  
**Cases:**
- Empty strings (booking ref, name)
- Null/undefined values
- Extremely long strings (10,000+ characters)
- Special characters (`, ~, !, @, #, $, etc.)
- Case variations (JOHN, john, John)

**Why:** Prevents crashes and exploits from malformed data  
**Expected:** App handles gracefully without breaking  

### NoSQL Injection (1 test)
**What:** Tests MongoDB-style injection attacks (not applicable here but good practice)  
**Payloads:** `{ $gt: '' }`, `{ $ne: null }`, `admin' || '1'=='1`  
**Why:** If Supabase ever adds NoSQL support or if you use NoSQL elsewhere  
**Expected:** Attempts fail safely  

### Error Message Safety (3 tests)
**What:** Checks that error messages don't leak sensitive info  
**Examples of bad errors:**
- "SELECT * FROM profiles WHERE booking_ref = '...'"
- "Column 'first_name' not found in table 'users'"
- "Password hash mismatch"

**Why:** Attackers can learn your DB structure from error messages  
**Expected:** Generic error: "Invalid credentials or connection error"  

### Timing Attack Resistance (1 test)
**What:** Ensures valid vs invalid credentials take same time to process  
**Why:** Attackers can guess valid usernames by measuring response times  
**How it works:** Runs 10 valid + 10 invalid logins, compares avg response time  
**Expected:** Time difference < 50ms (indicates consistent validation)  

## Authorization & Access Control Tests (9 tests)

### Event Data Isolation
**What:** Ensures users can only see their own event's data  
**Tests:**
- Valid event ID returns data
- Malicious event IDs (SQL injection) return null safely
- Path traversal attempts (`../../../etc/passwd`) blocked

**Why:** User A shouldn't see User B's event schedule  
**Expected:** Data filtered by eventId, other attempts safe  

### Schedule Data Scoping
**What:** Verifies schedules are filtered by user's event  
**Tests:**
- SQL injection in eventId parameter
- All returned items belong to requested event

**Why:** Prevent info leakage about other events  
**Expected:** Returns data for correct event only  

### Product Data Scoping
**What:** Shop inventory filtered by event  
**Tests:** Similar to schedule—injection prevention, data isolation  
**Why:** Each event has different products  
**Expected:** Safe filtering with no data leakage  

### User Profile Update Security
**What:** Tests WhatsApp number update endpoint  
**Tests:**
- Empty userId validation
- WhatsApp format validation
- SQL injection in userId (shouldn't allow update)

**Why:** Prevent account takeover via profile manipulation  
**Expected:** Update only works with valid userId  

## Client-Side Security Tests (`client-side.test.ts`)

### LocalStorage Security (5 tests)
**What:** Tests how safely auth data is stored in browser  
**Tests:**
- Handles corrupted data without crashing
- Validates data structure
- No sensitive data stored
- Proper namespace isolation (not global `user` or `auth` key)
- Can parse restored data after "page reload"

**Why:** LocalStorage is accessible to all JavaScript, not encrypted  
**Expected:** Store only what's needed, namespace it, validate on load  

### Zustand Store Security (3 tests)
**What:** Tests client-side state management  
**Tests:**
- `logout()` completely clears user + event data
- eventId matches user's eventId
- Prototype pollution prevention

**Why:** Client state shouldn't leak between users or sessions  
**Expected:** Logout clears everything, no data cross-contamination  

### XSS in Dynamic Content (2 tests)
**What:** Tests if user-controlled data causes XSS when displayed  
**Example:** If user's first name is `<script>alert()</script>`, React should escape it  
**Why:** React auto-escapes by default, but good to verify  
**Expected:** Scripts don't execute, data displayed safely  

### Session Management (2 tests)
**What:** Tests persistence across page reloads  
**Tests:**
- User stays logged in after refresh
- Hydration flag works correctly

**Why:** Session should survive natural browser actions  
**Expected:** User data persists from localStorage  

## E2E Tests (`security.spec.ts`)

### Authentication Flows (6 tests)
**What:** Real browser tests of login flow with attacks  
**Tests:**
- Login page displays correctly
- Empty credentials rejected
- SQL injection blocked
- XSS in forms blocked
- Network responses don't leak data
- Error messages consistent (brute force resistance)

**Why:** Tests real behavior, not mocks  
**Expected:** All attacks fail, legit users can login  

### Session Management (4 tests)
**What:** Browser-level session tests  
**Tests:**
- Session persists after page reload
- Logout clears session
- Corrupted localStorage handled
- No auth data in URL

**Why:** Prevents session hijacking  
**Expected:** Clean session boundaries  

### Authorization (3 tests)
**What:** Can't access protected routes without auth  
**Tests:**
- `/shop`, `/personal`, `/settings` redirect to login
- Direct URL manipulation (`?bypass=true`, `#admin`) doesn't work

**Why:** Route protection is first defense  
**Expected:** All protected routes require login  

### XSS in UI (2 tests)
**What:** Real browser XSS prevention  
**Tests:**
- Alerts don't fire (scripts blocked)
- HTML in error messages isn't rendered

**Why:** Ensures React escaping works in real browser  
**Expected:** No alerts, safe error display  

### Network Security (2 tests)
**What:** Network-level security  
**Tests:**
- All requests use HTTPS (or localhost)
- Sensitive data not logged to console

**Why:** Protect data in transit  
**Expected:** Secure communication, no leaks  

### DoS Prevention (2 tests)
**What:** App handles resource exhaustion  
**Tests:**
- Rapid form submissions don't crash
- Huge input values handled gracefully

**Why:** Prevent denial of service attacks  
**Expected:** App stays responsive and functional  

---

## Test Execution Flow

```
npm run test:security
    ↓
[Mock Supabase]
    ↓
[Run 50+ unit tests]
    ↓
✓ All pass
    ↓
[Generate coverage report]
```

Each test is **isolated** and runs in memory with fake data, so it's safe and fast.

---

## Reading Test Results

### ✅ All Green (Passing)
```
✓ SQL Injection Prevention (2)
✓ XSS Prevention (4)
✓ Input Validation (6)
...
Tests: 50 passed (50)
```
→ No vulnerabilities found!

### ❌ Red (Failing)
```
✗ SQL Injection Prevention > should reject booking ref injection
  expected true to be false
```
→ This input handling allows injection—needs fix in `app/actions.ts`

### ⚠️ Warnings
```
SLOW: Should X < Y took Zms
```
→ Test is slow, might indicate timing vulnerability

---

## When to Run Tests

| Scenario | Command |
|----------|---------|
| Before commit | `npm run test:security` |
| Code review | `npm run security:full` |
| After dependency update | `npm run security:scan` |
| Development (watch mode) | `npm run test:security -- --watch` |
| CI/CD pipeline | Runs automatically |

---

## Questions?

- **"Why does this test fail?"** → Check the test description above
- **"What does this payload do?"** → Google the payload name + "attack"
- **"How do I fix this?"** → See [TESTING_GUIDE.md](./TESTING_GUIDE.md)

