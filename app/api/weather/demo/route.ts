import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Weather from "@/models/Weather";
import TrackedCity from "@/models/TrackedCity";
import { getCache, CacheKeys, CacheTTL } from "@/lib/cache";

// Cache duration for fresh weather data (10 minutes)
const FRESH_DATA_THRESHOLD_MS = 10 * 60 * 1000;

/**
 * Fetch live weather data from Open-Meteo API
 */
async function fetchLiveWeather(lat: number, lon: number, cityName: string) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo API returned ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;

    if (!current) {
      throw new Error("API response missing current weather data");
    }

    return {
      city: cityName,
      lat,
      lon,
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      pressure: current.pressure_msl,
      timestamp: new Date(),
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Validate city using geocoding API and return city info
 */
async function validateCity(cityName: string) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(geoUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Geocoding API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    const cityInfo = data.results[0];
    return {
      name: cityInfo.name,
      lat: cityInfo.latitude,
      lon: cityInfo.longitude,
      country: cityInfo.country,
      state: cityInfo.admin1,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city");
  if (!city) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "City parameter is required" } },
      { status: 400 }
    );
  }

  try {
    const cache = getCache();
    const cacheKey = CacheKeys.weather.current(city);

    // Check cache first (fastest path)
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          "X-Cache": "HIT",
        },
      });
    }

    await connectDB();

    // Check if city exists in database with recent data
    let weatherData = await Weather.findOne({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    }).sort({ timestamp: -1 });

    const now = new Date();
    const isDataFresh = weatherData && 
      (now.getTime() - new Date(weatherData.timestamp).getTime()) < FRESH_DATA_THRESHOLD_MS;

    // CASE A: Fresh data exists in DB - return immediately
    if (isDataFresh) {
      await cache.set(cacheKey, weatherData, { ttl: CacheTTL.WEATHER_CURRENT });
      return NextResponse.json(weatherData, {
        headers: {
          "X-Cache": "DB-HIT",
        },
      });
    }

    // CASE B: City exists but data is stale OR CASE C: City doesn't exist
    // Both cases require fetching live data

    let cityInfo = null;
    let isNewCity = false;

    // Check if city is already tracked
    const trackedCity = await TrackedCity.findOne({
      name: { $regex: new RegExp(`^${city}$`, "i") },
    });

    if (trackedCity) {
      // CASE B: City exists but data is stale
      cityInfo = {
        name: trackedCity.name,
        lat: trackedCity.lat,
        lon: trackedCity.lon,
      };
    } else {
      // CASE C: City doesn't exist - validate and add to tracked cities
      isNewCity = true;
      try {
        cityInfo = await validateCity(city);

        if (!cityInfo) {
          return NextResponse.json(
            {
              error: {
                code: "CITY_NOT_FOUND",
                message: "City not found. Please check the spelling and try again.",
              },
            },
            { status: 404 }
          );
        }

        // Add city to tracked cities (for demo, we don't track user)
        await TrackedCity.findOneAndUpdate(
          { name: cityInfo.name },
          {
            name: cityInfo.name,
            lat: cityInfo.lat,
            lon: cityInfo.lon,
            country: cityInfo.country,
            state: cityInfo.state,
            addedBy: "demo",
            isActive: true,
            lastFetched: new Date(),
            fetchCount: 1,
            updatedAt: new Date(),
          },
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error("City validation error:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // Check if it's a timeout or network error
        if (
          errorMessage.includes("abort") ||
          errorMessage.includes("ETIMEDOUT") ||
          errorMessage.includes("ECONNREFUSED") ||
          errorMessage.includes("ENOTFOUND")
        ) {
          return NextResponse.json(
            {
              error: {
                code: "SERVICE_UNAVAILABLE",
                message:
                  "Geocoding service is temporarily unavailable. Please check your internet connection and try again.",
              },
            },
            { status: 503 }
          );
        }

        return NextResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Failed to validate city. Please try again.",
              details: errorMessage,
            },
          },
          { status: 500 }
        );
      }
    }

    // Fetch live weather data from Open-Meteo (ON-DEMAND PATH)
    try {
      const liveWeather = await fetchLiveWeather(cityInfo.lat, cityInfo.lon, cityInfo.name);

      // Store the weather snapshot in database
      await Weather.create(liveWeather);

      // Update tracked city fetch info
      if (!isNewCity) {
        await TrackedCity.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${cityInfo.name}$`, "i") } },
          {
            lastFetched: new Date(),
            $inc: { fetchCount: 1 },
            updatedAt: new Date(),
          }
        );
      }

      // Cache the fresh weather data
      await cache.set(cacheKey, liveWeather, { ttl: CacheTTL.WEATHER_CURRENT });

      // Return weather data immediately to user
      return NextResponse.json(liveWeather, {
        headers: {
          "X-Cache": "LIVE-FETCH",
        },
      });
    } catch (error) {
      console.error("Error fetching live weather:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Check if it's a timeout or network error
      if (
        errorMessage.includes("abort") ||
        errorMessage.includes("ETIMEDOUT") ||
        errorMessage.includes("ECONNREFUSED") ||
        errorMessage.includes("ENOTFOUND")
      ) {
        return NextResponse.json(
          {
            error: {
              code: "SERVICE_UNAVAILABLE",
              message:
                "Weather service is temporarily unavailable. Please try again.",
            },
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          error: {
            code: "FETCH_ERROR",
            message: "Failed to fetch weather data. Please try again.",
            details: errorMessage,
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in weather demo endpoint:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch weather data",
          details: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}
