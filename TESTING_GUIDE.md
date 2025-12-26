# Testing Guide - Understanding How Tests Work

This guide explains how testing works in this project, line by line.

## Table of Contents
- [What is Testing?](#what-is-testing)
- [The Tools We Use](#the-tools-we-use)
- [How Testing Works - The Flow](#how-testing-works---the-flow)
- [Line-by-Line Code Breakdown](#line-by-line-code-breakdown)
- [Common Testing Patterns](#common-testing-patterns)
- [Running Tests](#running-tests)

---

## What is Testing?

Testing is **writing code that checks if your code works correctly**. Instead of manually clicking around your app to see if things work, you write automated tests that do it for you.

---

## The Tools We Use

**1. Jest** - The Test Runner
- Think of it like `npm run dev` but for tests
- It finds all your test files and runs them
- Shows ✅ or ❌ for each test

**2. React Testing Library** - For Testing React Components
- Helps you test components like a user would interact with them
- Click buttons, type in forms, check if text appears

**3. TypeScript** - We already have this
- Same TypeScript we use, but for tests

---

## How Testing Works - The Flow

### Step 1: Write a Test File
You create files like `component.test.tsx` or `function.test.ts` next to your code:

```
lib/
  rate-limit.ts          ← Your actual code
  rate-limit.test.ts     ← Tests for rate-limit.ts
```

### Step 2: Write Test Cases
A test file looks like this:

```typescript
import { aiQuizGenerationLimiter } from './rate-limit';

// describe = group of related tests
describe('Rate Limiter', () => {

  // test = individual test case
  test('should allow first request', () => {
    const result = aiQuizGenerationLimiter.check('user123');

    // expect = assertion (checking if something is true)
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4); // Max is 5, used 1, so 4 remaining
  });
});
```

### Step 3: Run Tests
```bash
npm test
```

Output looks like:
```
✓ Rate Limiter › should allow first request (5ms)

Tests: 1 passed, 1 total
```

---

## Line-by-Line Code Breakdown

Let's analyze the actual test file: `lib/rate-limit.test.ts`

### Line 1: Import Statement
```typescript
import { aiQuizGenerationLimiter, formatResetTime } from './rate-limit';
```

**What it does:**
- Brings in the code we want to test from `rate-limit.ts`
- `aiQuizGenerationLimiter` = An instance of RateLimiter class (created at line 105-108 in rate-limit.ts)
- `formatResetTime` = A function that formats time (line 132-141 in rate-limit.ts)

**Think of it as:** "Hey test file, grab these things from rate-limit.ts so we can test them"

---

### Line 3: Describe Block
```typescript
describe('Rate Limiter', () => {
```

**What it does:**
- Groups related tests together
- Everything inside `{ }` is part of this group
- Shows up in test output as a category

**Think of it as:** Creating a folder to organize tests

**Real example:**
```
Rate Limiter          ← This is the describe block
  ✓ should allow first request
  ✓ should track remaining requests
```

---

### Lines 5-7: beforeEach Hook
```typescript
beforeEach(() => {
  aiQuizGenerationLimiter.reset('test-user');
});
```

**What it does:**
- Runs BEFORE every single test
- Cleans up the state so tests don't affect each other

**What is `.reset()`?**
From `rate-limit.ts` line 80-82:
```typescript
reset(identifier: string): void {
  this.requests.delete(identifier);
}
```
- `.reset('test-user')` = Delete 'test-user' from the internal Map
- It's like erasing that user's request history

**Why we need this:**

Without `beforeEach`:
```
Test 1: User makes 5 requests ← User count = 5
Test 2: User makes 1 request  ← User count = 6 (WRONG! Should be 1)
```

With `beforeEach`:
```
Test 1: User makes 5 requests ← User count = 5
beforeEach: reset('test-user') ← User count = 0 (cleaned!)
Test 2: User makes 1 request  ← User count = 1 (CORRECT!)
```

**Think of it as:** Pressing "New Game" before each test so they start fresh

---

### Lines 9-16: First Test
```typescript
test('should allow first request', () => {
  const result = aiQuizGenerationLimiter.check('test-user');

  expect(result.allowed).toBe(true);
  expect(result.remaining).toBe(4);
});
```

**Line by line:**

#### Line 9: `test('should allow first request', () => {`
- `test()` = Define a single test
- `'should allow first request'` = Test name (shows in output)
- `() => {` = Function that contains the test code

#### Line 11: `const result = aiQuizGenerationLimiter.check('test-user');`
- **Calls the `.check()` method** from rate-limit.ts (line 25)
- Passes `'test-user'` as the identifier
- Returns an object like: `{ allowed: true, remaining: 4, resetTime: 1234567890 }`

**What `.check()` does internally:**
1. Looks in the Map for 'test-user' (line 27 in rate-limit.ts)
2. Not found (first request), so creates new entry (line 31-35)
3. Sets count = 1
4. Returns `allowed: true, remaining: 4` (maxRequests is 5, used 1, so 5-1=4 remaining)

#### Line 14: `expect(result.allowed).toBe(true);`
- `expect(result.allowed)` = "I expect result.allowed to..."
- `.toBe(true)` = "...be exactly true"

**If this fails:**
```
Expected: true
Received: false
```

#### Line 15: `expect(result.remaining).toBe(4);`
- Checks that `result.remaining` equals exactly 4
- **Why 4?** Because max is 5, we used 1, so 5 - 1 = 4 remaining

---

### Lines 18-27: Second Test
```typescript
test('should track remaining requests correctly', () => {
  aiQuizGenerationLimiter.check('test-user');
  aiQuizGenerationLimiter.check('test-user');
  const result = aiQuizGenerationLimiter.check('test-user');

  expect(result.allowed).toBe(true);
  expect(result.remaining).toBe(2);
});
```

**What's happening:**

#### Lines 20-22: Make 3 requests
```typescript
aiQuizGenerationLimiter.check('test-user'); // Request #1
aiQuizGenerationLimiter.check('test-user'); // Request #2
const result = aiQuizGenerationLimiter.check('test-user'); // Request #3
```

**Internally in `.check()`:**
- Request #1: count = 1, remaining = 4
- Request #2: count = 2, remaining = 3
- Request #3: count = 3, remaining = 2

#### Line 26: `expect(result.remaining).toBe(2);`
- After 3 requests, should have 2 remaining (5 max - 3 used = 2)

---

### Lines 29-40: Third Test (The Important One!)
```typescript
test('should block requests after limit exceeded', () => {
  for (let i = 0; i < 5; i++) {
    aiQuizGenerationLimiter.check('test-user');
  }

  const result = aiQuizGenerationLimiter.check('test-user');

  expect(result.allowed).toBe(false);
  expect(result.remaining).toBe(0);
});
```

**What's happening:**

#### Lines 31-33: Make 5 requests (hit the limit)
```typescript
for (let i = 0; i < 5; i++) {
  aiQuizGenerationLimiter.check('test-user');
}
```
- Loop runs 5 times
- Each time calls `.check('test-user')`
- After loop: count = 5 (LIMIT REACHED!)

#### Line 36: Make 6th request
```typescript
const result = aiQuizGenerationLimiter.check('test-user');
```

**What happens in `.check()` now?**
From rate-limit.ts line 44-50:
```typescript
if (entry.count >= this.maxRequests) {  // 5 >= 5 is TRUE!
  return {
    allowed: false,  // BLOCKED!
    remaining: 0,
    resetTime: entry.resetTime,
  };
}
```

#### Lines 38-39: Verify blocking works
```typescript
expect(result.allowed).toBe(false); // Should be blocked
expect(result.remaining).toBe(0);   // No requests left
```

---

### Lines 42-52: Fourth Test (Multi-user)
```typescript
test('should handle different users independently', () => {
  for (let i = 0; i < 5; i++) {
    aiQuizGenerationLimiter.check('user-1');
  }

  const user2Result = aiQuizGenerationLimiter.check('user-2');
  expect(user2Result.allowed).toBe(true);
  expect(user2Result.remaining).toBe(4);
});
```

**The Test:**
1. 'user-1' makes 5 requests (hits limit)
2. 'user-2' makes 1 request
3. **'user-2' should NOT be blocked** (different user!)

**Why this works:**
The Map stores users separately:
```typescript
requests: Map {
  'user-1' => { count: 5, resetTime: ... },  // Blocked
  'user-2' => { count: 1, resetTime: ... }   // Still allowed
}
```

---

### Lines 55-73: Testing `formatResetTime` Function
```typescript
describe('formatResetTime', () => {
  test('should format seconds correctly', () => {
    const resetTime = Date.now() + 30000;
    const result = formatResetTime(resetTime);
    expect(result).toBe('30 seconds');
  });
```

**Line 57: `Date.now() + 30000`**
- `Date.now()` = Current time in milliseconds (e.g., 1735142400000)
- `+ 30000` = Add 30 seconds (30,000 milliseconds)
- Result = "30 seconds from now"

**Line 58: Call the function**
```typescript
const result = formatResetTime(resetTime);
```

**What `formatResetTime()` does** (rate-limit.ts line 132-141):
```typescript
export function formatResetTime(resetTime: number): string {
  const secondsRemaining = Math.ceil((resetTime - Date.now()) / 1000);

  if (secondsRemaining < 60) {
    return `${secondsRemaining} second${secondsRemaining === 1 ? "" : "s"}`;
  }

  const minutesRemaining = Math.ceil(secondsRemaining / 60);
  return `${minutesRemaining} minute${minutesRemaining === 1 ? "" : "s"}`;
}
```

**Step by step:**
1. Calculate: `(resetTime - Date.now()) / 1000` = seconds remaining
2. If < 60 seconds: return "30 seconds"
3. If >= 60 seconds: return "2 minutes"

**Line 59: Verify**
```typescript
expect(result).toBe('30 seconds');
```

---

## Common Testing Patterns

### The 3 A's of Testing
Every test follows this pattern:

1. **Arrange** - Set up the test (create data, reset state)
2. **Act** - Do the thing you're testing (call function, click button)
3. **Assert** - Verify it worked (use expect())

Example:
```typescript
test('example', () => {
  // Arrange
  const user = 'test-user';

  // Act
  const result = aiQuizGenerationLimiter.check(user);

  // Assert
  expect(result.allowed).toBe(true);
});
```

### Common Jest Methods

| Method | What it Does | Example |
|--------|--------------|---------|
| `describe()` | Groups related tests | `describe('Feature', () => {})` |
| `test()` | Defines a single test | `test('does thing', () => {})` |
| `beforeEach()` | Runs before every test | `beforeEach(() => reset())` |
| `expect(x).toBe(y)` | Assert x equals y exactly | `expect(5).toBe(5)` |
| `expect(x).toEqual(y)` | Assert deep equality (objects/arrays) | `expect({a: 1}).toEqual({a: 1})` |
| `expect(x).toBeTruthy()` | Assert x is truthy | `expect('hello').toBeTruthy()` |
| `expect(x).toBeNull()` | Assert x is null | `expect(null).toBeNull()` |

### Common Rate Limiter Methods

| Method | What it Does | Example |
|--------|--------------|---------|
| `.check(id)` | Checks if user can make request | `aiQuizGenerationLimiter.check('user123')` |
| `.reset(id)` | Deletes user from Map (clean slate) | `aiQuizGenerationLimiter.reset('user123')` |
| `.getStats()` | Get monitoring stats | `aiQuizGenerationLimiter.getStats()` |

---

## Running Tests

### Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-reruns when files change)
npm test:watch

# Run tests with coverage report
npm test:coverage
```

### Test Output

When you run `npm test`, you'll see:

```
PASS lib/rate-limit.test.ts
  Rate Limiter
    ✓ should allow first request (1 ms)
    ✓ should track remaining requests correctly
    ✓ should block requests after limit exceeded
    ✓ should handle different users independently
  formatResetTime
    ✓ should format seconds correctly
    ✓ should format single second correctly
    ✓ should format minutes correctly

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        0.481 s
```

**What this means:**
- All 7 tests passed ✅
- Tests ran in 0.481 seconds
- No failures or errors

---

## Key Concept: Why `.reset()` Exists

**From rate-limit.ts line 76-82:**
```typescript
/**
 * Manually reset rate limit for a specific identifier
 * Useful for testing or admin overrides
 */
reset(identifier: string): void {
  this.requests.delete(identifier);
}
```

**The comment says "Useful for testing"** - that's EXACTLY what we're using it for!

Without `.reset()`, tests would be messy:
```typescript
// BAD: Tests interfere with each other
test('test 1', () => {
  check('user'); check('user'); check('user'); // count = 3
});

test('test 2', () => {
  check('user'); // count = 4 (WRONG! Should start at 1)
});
```

With `.reset()`:
```typescript
// GOOD: Each test starts clean
beforeEach(() => reset('user'));

test('test 1', () => {
  check('user'); check('user'); check('user'); // count = 3
});

test('test 2', () => {
  // reset() ran, so count = 0
  check('user'); // count = 1 (CORRECT!)
});
```

---

## Real-World Example: The Publish Button Bug

We found a bug where the publish button kept spinning after successfully publishing a course. Here's how a test would catch it:

```typescript
test('publish button stops loading after success', async () => {
  // Arrange
  render(<PublishToggle courseId="123" instructorId="456" isPublished={false} />);

  // Act
  const button = screen.getByRole('button', { name: /publish course/i });
  await userEvent.click(button);

  // Assert - wait for action to complete
  await waitFor(() => {
    expect(button).not.toBeDisabled(); // THIS WOULD FAIL before the fix!
  });
});
```

**The bug:** Button stayed disabled because `setIsToggling(false)` was never called on success.

**The fix:** Added a `finally` block to always reset the loading state.

**The lesson:** Tests catch bugs automatically!

---

## Next Steps

1. **Component Tests** - Test React components (Footer, Buttons, Forms)
2. **Integration Tests** - Test multiple parts working together (Auth flow, Course creation)
3. **CI/CD** - Run tests automatically on GitHub before deploying

---

## Summary

Testing is just:
1. **Arrange** - Set up (like `reset()`)
2. **Act** - Do the thing (like `check()`)
3. **Assert** - Verify it worked (like `expect()`)

Every test follows this pattern. Once you understand this, you can test anything!

---

*Created: December 2024*
*Project: Adaptly - AI-Powered Learning Platform*
