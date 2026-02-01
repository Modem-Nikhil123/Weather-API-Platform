import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Weather from "@/models/Weather";
import TrackedCity from "@/models/TrackedCity";
import axios from "axios";

// This endpoint is protected by Vercel Cron authentication
// Vercel adds a special header: x-vercel-cron: true
export async function GET(req: Request) {
  // Verify this is a cron job request
  const authHeader = req.headers.get("authorization");
  const cronHeader = req.headers.get("x-vercel-cron");

  // Allow requests from cron jobs or with valid auth token
  if (!cronHeader && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
  } catch (error) {
    console.error("❌ Failed to connect to database:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }

  // Get all active tracked cities
  const trackedCities = await TrackedCity.find({ isActive: true });

  if (trackedCities.length === 0) {
    console.log("No cities to track. Add cities first.");
    return NextResponse.json({
      message: "No cities to track",
      citiesProcessed: 0,
      success: true
    });
  }

  console.log(`Fetching weather for ${trackedCities.length} cities...`);

  const results = {
    success: 0,
    failed: 0,
    citiesProcessed: trackedCities.length,
    details: [] as Array<{ city: string; status: string; error?: string }>
  };

  for (const city of trackedCities) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m`;

      const res = await axios.get(url);
      const current = res.data.current;

      // Validate API response structure
      if (!current) {
        throw new Error("API response missing current weather data");
      }

      await Weather.create({
        city: city.name,
        lat: city.lat,
        lon: city.lon,
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        pressure: current.pressure_msl,
      });

      // Update tracking info
      await TrackedCity.findByIdAndUpdate(city._id, {
        lastFetched: new Date(),
        $inc: { fetchCount: 1 },
        updatedAt: new Date()
      });

      console.log(`✅ Stored weather for ${city.name}: ${current.temperature_2m}°C`);
      results.success++;
      results.details.push({
        city: city.name,
        status: "success"
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to fetch weather for ${city.name}:`, errorMessage);
      results.failed++;
      results.details.push({
        city: city.name,
        status: "failed",
        error: errorMessage
      });

      // Mark city as inactive after multiple failures
      try {
        await TrackedCity.findByIdAndUpdate(city._id, {
          $inc: { fetchCount: 1 },
          updatedAt: new Date()
        });
      } catch (dbError) {
        console.error(`❌ Failed to update tracking info for ${city.name}:`, dbError instanceof Error ? dbError.message : String(dbError));
      }
    }
  }

  console.log(`🎉 Weather ingestion completed for ${trackedCities.length} cities`);

  return NextResponse.json({
    message: "Weather ingestion completed",
    ...results,
    success: true
  });
}

// Also support POST for manual triggering
export async function POST(req: Request) {
  return GET(req);
}
