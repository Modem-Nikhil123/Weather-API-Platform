import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import TrackedCity from "@/models/TrackedCity";
import Weather from "@/models/Weather";
import axios from "axios";

// Helper function to fetch weather for a specific city
async function fetchWeatherForCity(city: any) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m`;

    const res = await axios.get(url);
    const current = res.data.current;

    if (!current) {
      throw new Error("API response missing current weather data");
    }

    const weatherData = {
      city: city.name,
      lat: city.lat,
      lon: city.lon,
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      pressure: current.pressure_msl,
      timestamp: new Date(),
    };

    await Weather.create(weatherData);

    // Update tracking info
    await TrackedCity.findByIdAndUpdate(city._id, {
      lastFetched: new Date(),
      $inc: { fetchCount: 1 },
      updatedAt: new Date()
    });

    console.log(`✅ Initial weather fetched for ${city.name}: ${current.temperature_2m}°C`);
    return { success: true, weather: weatherData };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Failed to fetch initial weather for ${city.name}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { city } = body;

    if (!city || typeof city !== "string") {
      return NextResponse.json(
        { error: "City name is required" },
        { status: 400 }
      );
    }

    // Validate city using geocoding API with timeout
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const geoResponse = await fetch(geoUrl, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!geoResponse.ok) {
      throw new Error(`Geocoding API returned ${geoResponse.status}`);
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      return NextResponse.json(
        { error: "City not found. Please check the spelling and try again." },
        { status: 404 }
      );
    }

    const cityInfo = geoData.results[0];

    await connectDB();

    // Check if city is already being tracked
    const existingCity = await TrackedCity.findOne({ name: cityInfo.name });

    if (existingCity) {
      // Reactivate if it was inactive
      if (!existingCity.isActive) {
        await TrackedCity.findByIdAndUpdate(existingCity._id, {
          isActive: true,
          updatedAt: new Date(),
        });

        // Trigger immediate weather fetch for reactivated city
        const weatherResult = await fetchWeatherForCity(existingCity);

        return NextResponse.json({
          message: "City is already being tracked",
          city: existingCity,
          status: "already_tracked",
          reactivated: true,
          weather: weatherResult.success ? weatherResult.weather : null,
        });
      }

      // City is already active, fetch current weather
      const weatherResult = await fetchWeatherForCity(existingCity);

      return NextResponse.json({
        message: "City is already being tracked",
        city: existingCity,
        status: "already_tracked",
        weather: weatherResult.success ? weatherResult.weather : null,
      });
    }

    // Add city to tracked cities
    const trackedCity = await TrackedCity.create({
      name: cityInfo.name,
      lat: cityInfo.latitude,
      lon: cityInfo.longitude,
      country: cityInfo.country,
      state: cityInfo.admin1,
      addedBy: session.user.email,
      isActive: true,
    });

    // Trigger immediate weather fetch for newly added city
    const weatherResult = await fetchWeatherForCity(trackedCity);

    return NextResponse.json({
      message: `City "${cityInfo.name}" added to tracking`,
      city: trackedCity,
      status: "tracking_started",
      weather: weatherResult.success ? weatherResult.weather : null,
    });
  } catch (error) {
    console.error("Error tracking city:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check if it's a timeout error
    if (errorMessage.includes('abort') || errorMessage.includes('ETIMEDOUT')) {
      return NextResponse.json(
        { 
          error: {
            code: "SERVICE_UNAVAILABLE",
            message: "Geocoding service is temporarily unavailable. Please try again later.",
          }
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: {
          code: "TRACKING_ERROR",
          message: "Failed to track city",
          details: errorMessage,
        }
      },
      { status: 500 }
    );
  }
}
