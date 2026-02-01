import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getCache, CacheKeys, CacheTTL } from "@/lib/cache";

export interface AuthenticatedUser {
  _id: string;
  email: string;
  name?: string;
  plan: string;
  dailyQuota: number;
  monthlyQuota: number;
  apiKey: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
}

/**
 * Validates API key and returns authenticated user
 * @param req - Next.js request object
 * @returns AuthResult with user data or error
 */
export async function withApiKeyAuth(req: NextRequest): Promise<AuthResult> {
  try {
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return {
        success: false,
        error: "API key is required. Include it in the 'x-api-key' header.",
      };
    }

    // Check cache first
    const cache = getCache();
    const cacheKey = CacheKeys.apiKey(apiKey);
    const cachedUser = await cache.get<AuthenticatedUser>(cacheKey);

    if (cachedUser) {
      return {
        success: true,
        user: cachedUser,
      };
    }

    // Cache miss - fetch from database
    await connectDB();

    const user = await User.findOne({ apiKey }).select(
      "_id email name plan dailyQuota monthlyQuota apiKey"
    );

    if (!user) {
      return {
        success: false,
        error: "Invalid API key. Please check your API key and try again.",
      };
    }

    const userData: AuthenticatedUser = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name || undefined,
      plan: user.plan,
      dailyQuota: user.dailyQuota,
      monthlyQuota: user.monthlyQuota,
      apiKey: user.apiKey,
    };

    // Cache the user data
    await cache.set(cacheKey, userData, { ttl: CacheTTL.API_KEY });

    return {
      success: true,
      user: userData,
    };
  } catch (error) {
    console.error("Error in API key authentication:", error);
    return {
      success: false,
      error: "Authentication failed. Please try again later.",
    };
  }
}

/**
 * Helper function to create unauthorized response
 */
export function unauthorizedResponse(message: string = "Unauthorized") {
  return new Response(
    JSON.stringify({
      error: {
        code: "UNAUTHORIZED",
        message,
      },
    }),
    {
      status: 401,
      headers: { "Content-Type": "application/json" },
    }
  );
}
