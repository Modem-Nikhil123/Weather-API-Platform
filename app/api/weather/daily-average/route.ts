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
  const rateLimitResult = await withRateLimit(
    user,
    "/api/weather/daily-average"
  );
  if (!rateLimitResult.allowed) {
    return rateLimitExceededResponse(
      rateLimitResult.error!,
      rateLimitResult.headers || {}
    );
  }

  const city = req.nextUrl.searchParams.get("city");
  const date = req.nextUrl.searchParams.get("date");

  if (!city) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "City parameter is required" } },
      { status: 400 }
    );
  }

  if (!date) {
    return NextResponse.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "Date parameter is required (YYYY-MM-DD)",
        },
      },
      { status: 400 }
    );
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return NextResponse.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "Invalid date format. Use YYYY-MM-DD",
        },
      },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const startDate = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(`${date}T23:59:59.999Z`);

    const weatherData = await Weather.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
      timestamp: { $gte: startDate, $lte: endDate },
    }).limit(1000); // limit to prevent excessive data

    if (weatherData.length === 0) {
      return NextResponse.json(
        {
          city,
          date,
          message: "No weather data available for this date",
        },
        { status: 404 }
      );
    }

    // Calculate averages
    const totals = weatherData.reduce(
      (acc, record) => ({
        temperature: acc.temperature + (record.temperature || 0),
        humidity: acc.humidity + (record.humidity || 0),
        windSpeed: acc.windSpeed + (record.windSpeed || 0),
        pressure: acc.pressure + (record.pressure || 0),
        count: acc.count + 1,
      }),
      { temperature: 0, humidity: 0, windSpeed: 0, pressure: 0, count: 0 }
    );

    const averages = {
      city,
      date,
      avgTemperature:
        Math.round((totals.temperature / totals.count) * 100) / 100,
      avgHumidity: Math.round((totals.humidity / totals.count) * 100) / 100,
      avgWindSpeed: Math.round((totals.windSpeed / totals.count) * 100) / 100,
      avgPressure: Math.round((totals.pressure / totals.count) * 100) / 100,
      dataPoints: totals.count,
    };

    // Return data with rate limit headers
    return NextResponse.json(averages, {
      headers: rateLimitResult.headers,
    });
  } catch (error) {
    console.error("Error fetching daily average:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch daily average weather",
          details: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}