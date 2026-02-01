import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Weather from "@/models/Weather";
import { withApiKeyAuth, unauthorizedResponse } from "@/lib/middleware/apiKeyAuth";
import { withRateLimit, rateLimitExceededResponse } from "@/lib/middleware/rateLimit";

export async function GET(req: NextRequest) {
  // Authenticate user
  const authResult = await withApiKeyAuth(req);
  if (!authResult.success) {
    return unauthorizedResponse(authResult.error!);
  }

  const user = authResult.user!;

  // Check rate limits
  const rateLimitResult = await withRateLimit(user, "/api/weather/history");
  if (!rateLimitResult.allowed) {
    return rateLimitExceededResponse(
      rateLimitResult.error!,
      rateLimitResult.headers || {}
    );
  }

  const city = req.nextUrl.searchParams.get("city");
  const hours = req.nextUrl.searchParams.get("hours");

  if (!city) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "City parameter is required" } },
      { status: 400 }
    );
  }

  const hoursNum = hours ? parseInt(hours) : 24; // default 24 hours
  if (hoursNum < 1 || hoursNum > 168) {
    // max 1 week
    return NextResponse.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "Hours parameter must be between 1 and 168 (1 week)",
        },
      },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const startTime = new Date();
    startTime.setHours(startTime.getHours() - hoursNum);

    const data = await Weather.find({
      city: { $regex: new RegExp(`^${city}$`, "i") }, // case insensitive
      timestamp: { $gte: startTime },
    })
      .sort({ timestamp: 1 }) // oldest first
      .limit(1000); // limit to prevent excessive data

    // Return data with rate limit headers
    return NextResponse.json(
      {
        city,
        hours: hoursNum,
        count: data.length,
        data,
      },
      {
        headers: rateLimitResult.headers,
      }
    );
  } catch (error) {
    console.error("Error fetching weather history:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch weather history",
          details: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}