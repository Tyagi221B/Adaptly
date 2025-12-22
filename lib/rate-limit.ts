interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry>;
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.requests = new Map();
    this.maxRequests = maxRequests; // Max requests per window
    this.windowMs = windowMs; // Time window in milliseconds (default: 1 minute)

    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if a request should be rate limited
   * @param identifier - Unique identifier (e.g., userId, IP address)
   * @returns Object with allowed status and remaining requests
   */
  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    // If no entry or entry expired, create new entry
    if (!entry || now > entry.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      this.requests.set(identifier, newEntry);

      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: newEntry.resetTime,
      };
    }

    // Check if limit exceeded
    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Increment count and allow request
    entry.count++;
    this.requests.set(identifier, entry);

    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Clean up expired entries to prevent memory leaks
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  /**
   * Manually reset rate limit for a specific identifier
   * Useful for testing or admin overrides
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Get current stats for monitoring
   */
  getStats(): { totalTracked: number; activeUsers: number } {
    const now = Date.now();
    let activeUsers = 0;

    for (const entry of this.requests.values()) {
      if (now <= entry.resetTime) {
        activeUsers++;
      }
    }

    return {
      totalTracked: this.requests.size,
      activeUsers,
    };
  }
}

// AI-specific rate limiters with different limits
export const aiQuizGenerationLimiter = new RateLimiter(
  5, // Max 5 quiz generations
  60000 // Per minute
);

export const aiRemedialContentLimiter = new RateLimiter(
  20, // Max 20 remedial content generations (more lenient as students take quizzes)
  60000 // Per minute
);

/**
 * Utility function to get rate limit identifier from request
 * Uses userId if available, falls back to IP address
 */
export function getRateLimitIdentifier(userId?: string, ip?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  if (ip) {
    return `ip:${ip}`;
  }
  return "anonymous";
}

/**
 * Format time remaining until rate limit reset
 */
export function formatResetTime(resetTime: number): string {
  const secondsRemaining = Math.ceil((resetTime - Date.now()) / 1000);

  if (secondsRemaining < 60) {
    return `${secondsRemaining} second${secondsRemaining === 1 ? "" : "s"}`;
  }

  const minutesRemaining = Math.ceil(secondsRemaining / 60);
  return `${minutesRemaining} minute${minutesRemaining === 1 ? "" : "s"}`;
}
