import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Weather from "@/models/Weather";
import Usage from "@/models/Usage";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // Get user data
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Parse query parameters
  const { searchParams } = new URL(req.url);
  const format = (searchParams.get("format") || "json").toLowerCase();
  const city = searchParams.get("city");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const dataType = searchParams.get("dataType") || "all"; // 'weather', 'usage', or 'all'

  // Validate format
  if (!["json", "csv"].includes(format)) {
    return NextResponse.json(
      { error: "Invalid format. Use 'json' or 'csv'" },
      { status: 400 }
    );
  }

  // Validate dataType
  if (!["weather", "usage", "all"].includes(dataType)) {
    return NextResponse.json(
      { error: "Invalid dataType. Use 'weather', 'usage', or 'all'" },
      { status: 400 }
    );
  }

  // Build weather query
  const weatherQuery: any = {};
  if (city) {
    weatherQuery.city = { $regex: new RegExp(`^${city}$`, "i") };
  }
  if (startDate || endDate) {
    weatherQuery.timestamp = {};
    if (startDate) {
      weatherQuery.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      weatherQuery.timestamp.$lte = new Date(endDate);
    }
  }

  // Get weather data
  let weatherData: any[] = [];
  if (dataType === "weather" || dataType === "all") {
    weatherData = await Weather.find(weatherQuery)
      .sort({ timestamp: -1 })
      .limit(5000);
  }

  // Get usage data
  let usageData: any[] = [];
  if (dataType === "usage" || dataType === "all") {
    const usageQuery: any = { apiKey: user.apiKey };
    if (startDate || endDate) {
      usageQuery.date = {};
      if (startDate) {
        usageQuery.date.$gte = startDate;
      }
      if (endDate) {
        usageQuery.date.$lte = endDate;
      }
    }
    usageData = await Usage.find(usageQuery).sort({ date: -1 }).limit(1000);
  }

  // Prepare export data
  const exportData = {
    exportDate: new Date().toISOString(),
    user: {
      name: user.name,
      email: user.email,
      plan: user.plan,
      dailyQuota: user.dailyQuota,
      monthlyQuota: user.monthlyQuota,
      createdAt: user.createdAt,
    },
    weatherData: weatherData.map((record) => ({
      city: record.city,
      lat: record.lat,
      lon: record.lon,
      temperature: record.temperature,
      humidity: record.humidity,
      pressure: record.pressure,
      windSpeed: record.windSpeed,
      timestamp: record.timestamp,
    })),
    usageData: usageData.map((record) => ({
      endpoint: record.endpoint,
      date: record.date,
      count: record.count,
    })),
    summary: {
      totalWeatherRecords: weatherData.length,
      totalUsageRecords: usageData.length,
      dateRange: {
        weather: {
          earliest:
            weatherData.length > 0
              ? weatherData[weatherData.length - 1].timestamp
              : null,
          latest: weatherData.length > 0 ? weatherData[0].timestamp : null,
        },
        usage: {
          earliest:
            usageData.length > 0 ? usageData[usageData.length - 1].date : null,
          latest: usageData.length > 0 ? usageData[0].date : null,
        },
      },
    },
  };

  // Generate filename
  const dateStr = new Date().toISOString().split("T")[0];
  const filename = `weather-platform-data-${dateStr}`;

  // Return based on format
  if (format === "csv") {
    // Convert to CSV
    const csvContent = convertToCSV(exportData, dataType);
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
      },
    });
  }

  // Return as JSON
  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}.json"`,
    },
  });
}

/**
 * Convert export data to CSV format
 */
function convertToCSV(data: any, dataType: string): string {
  const lines: string[] = [];

  // Add metadata
  lines.push(`# Weather Platform Data Export`);
  lines.push(`# Export Date: ${data.exportDate}`);
  lines.push(`# User: ${data.user.email}`);
  lines.push(`# Plan: ${data.user.plan}`);
  lines.push("");

  // Add weather data if requested
  if (dataType === "weather" || dataType === "all") {
    lines.push("# Weather Data");
    lines.push(
      "City,Latitude,Longitude,Temperature,Humidity,Pressure,Wind Speed,Timestamp"
    );
    data.weatherData.forEach((record: any) => {
      lines.push(
        [
          record.city,
          record.lat,
          record.lon,
          record.temperature,
          record.humidity,
          record.pressure,
          record.windSpeed,
          record.timestamp,
        ].join(",")
      );
    });
    lines.push("");
  }

  // Add usage data if requested
  if (dataType === "usage" || dataType === "all") {
    lines.push("# Usage Data");
    lines.push("Endpoint,Date,Count");
    data.usageData.forEach((record: any) => {
      lines.push([record.endpoint, record.date, record.count].join(","));
    });
    lines.push("");
  }

  // Add summary
  lines.push("# Summary");
  lines.push(`Total Weather Records: ${data.summary.totalWeatherRecords}`);
  lines.push(`Total Usage Records: ${data.summary.totalUsageRecords}`);

  return lines.join("\n");
}