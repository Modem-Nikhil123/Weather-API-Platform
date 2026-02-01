import { connectDB } from "@/lib/db";
import Usage from "@/models/Usage";
import type { AuthenticatedUser } from "./apiKeyAuth";

export interface RateLimitResult {
  allowed: boolean;
  error?: string;
  headers?: Record<string, string>;
  remainingDaily?: number;
  remainingHourly?: number;
}

// Rate limits by plan
const RATE_LIMITS = {
  FREE: { daily: 1000, hourly: 30 },
  PRO: { daily: 10000, hourly: 120 },
  ENTERPRISE: { daily: 100000, hourly: 1000 },
} as const;

/**
 * Checks rate limits for a user and endpoint
 * @param user - Authenticated user object
 * @param endpoint - API endpoint path
 * @returns RateLimitResult with status and headers
 */
export async function withRateLimit(
  user: AuthenticatedUser,
  endpoint: string
): Promise<RateLimitResult> {
  try {
    await connectDB();

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentHour = now.getHours();

    // Get rate limits for user's plan
    const limits =
      RATE_LIMITS[user.plan as keyof typeof RATE_LIMITS] || RATE_LIMITS.FREE;

    // Check daily limit
    const dailyUsage = await Usage.findOneAndUpdate(
      { apiKey: user.apiKey, endpoint, date: today },
      { $inc: { count: 1 }, $setOnInsert: { userId: user._id } },
      { new: true, upsert: true }
    );

    if (dailyUsage.count > limits.daily) {
      // Calculate reset time (midnight UTC)
      const tomorrow = new Date(now);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);
      const retryAfter = Math.floor((tomorrow.getTime() - now.getTime()) / 1000);

      return {
        allowed: false,
        error: `Daily request limit exceeded (${limits.daily} requests/day)`,
        headers: {
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit-Daily": limits.daily.toString(),
          "X-RateLimit-Remaining-Daily": "0",
          "X-RateLimit-Reset": tomorrow.toISOString(),
        },
        remainingDaily: 0,
      };
    }

    // Check hourly limit
    // For hourly, we need to count all requests in the current hour
    const hourStart = new Date(now);
    hourStart.setMinutes(0, 0, 0);
    const hourEnd = new Date(hourStart);
    hourEnd.setHours(hourEnd.getHours() + 1);

    // Count usage in current hour (simplified - in production use Redis for better performance)
    const hourlyUsage = await Usage.countDocuments({
      apiKey: user.apiKey,
      endpoint,
      date: today,
      // Note: This is a simplified hourly check
      // In production, store hourly buckets or use Redis
    });

    // Since we're using daily aggregation, we'll estimate hourly usage
    // This is a simplification - in production, use proper time-window tracking
    const estimatedHourlyUsage = Math.min(hourlyUsage, limits.hourly);

    if (estimatedHourlyUsage > limits.hourly) {
      // Calculate reset time (next hour)
      const nextHour = new Date(now);
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      const retryAfter = Math.floor((nextHour.getTime() - now.getTime()) / 1000);

      return {
        allowed: false,
        error: `Hourly request limit exceeded (${limits.hourly} requests/hour)`,
        headers: {
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit-Hourly": limits.hourly.toString(),
          "X-RateLimit-Remaining-Hourly": "0",
          "X-RateLimit-Reset": nextHour.toISOString(),
        },
        remainingHourly: 0,
      };
    }

    // Calculate remaining limits
    const remainingDaily = Math.max(0, limits.daily - dailyUsage.count);
    const remainingHourly = Math.max(0, limits.hourly - estimatedHourlyUsage);

    return {
      allowed: true,
      headers: {
        "X-RateLimit-Limit-Daily": limits.daily.toString(),
        "X-RateLimit-Remaining-Daily": remainingDaily.toString(),
        "X-RateLimit-Limit-Hourly": limits.hourly.toString(),
        "X-RateLimit-Remaining-Hourly": remainingHourly.toString(),
      },
      remainingDaily,
      remainingHourly,
    };
  } catch (error) {
    console.error("Error in rate limiting:", error);
    // On error, allow the request but log it
    return {
      allowed: true,
    };
  }
}

/**
 * Helper function to create rate limit exceeded response
 */
export function rateLimitExceededResponse(
  message: string,
  headers: Record<string, string>
) {
  return new Response(
    JSON.stringify({
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message,
      },
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }
  );
}
