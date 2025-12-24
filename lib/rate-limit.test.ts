import { aiQuizGenerationLimiter, formatResetTime } from './rate-limit';

describe('Rate Limiter', () => {
  // Before each test, reset the rate limiter to clean state
  beforeEach(() => {
    aiQuizGenerationLimiter.reset('test-user');
  });

  test('should allow first request', () => {
    // Act: Check if request is allowed
    const result = aiQuizGenerationLimiter.check('test-user');

    // Assert: Verify the result
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4); // Max is 5, used 1, so 4 remaining
  });

  test('should track remaining requests correctly', () => {
    // Make 3 requests
    aiQuizGenerationLimiter.check('test-user');
    aiQuizGenerationLimiter.check('test-user');
    const result = aiQuizGenerationLimiter.check('test-user');

    // After 3 requests, should have 2 remaining
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  test('should block requests after limit exceeded', () => {
    // Make 5 requests (the limit)
    for (let i = 0; i < 5; i++) {
      aiQuizGenerationLimiter.check('test-user');
    }

    // 6th request should be blocked
    const result = aiQuizGenerationLimiter.check('test-user');

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  test('should handle different users independently', () => {
    // User 1 makes 5 requests (hits limit)
    for (let i = 0; i < 5; i++) {
      aiQuizGenerationLimiter.check('user-1');
    }

    // User 2 should still be allowed
    const user2Result = aiQuizGenerationLimiter.check('user-2');
    expect(user2Result.allowed).toBe(true);
    expect(user2Result.remaining).toBe(4);
  });
});

describe('formatResetTime', () => {
  test('should format seconds correctly', () => {
    const resetTime = Date.now() + 30000; // 30 seconds from now
    const result = formatResetTime(resetTime);
    expect(result).toBe('30 seconds');
  });

  test('should format single second correctly', () => {
    const resetTime = Date.now() + 1000; // 1 second from now
    const result = formatResetTime(resetTime);
    expect(result).toBe('1 second'); // Should be singular
  });

  test('should format minutes correctly', () => {
    const resetTime = Date.now() + 120000; // 120 seconds = 2 minutes
    const result = formatResetTime(resetTime);
    expect(result).toBe('2 minutes');
  });
});
