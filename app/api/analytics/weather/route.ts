import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Weather from "@/models/Weather";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // Get date range for last 7 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  // Temperature trends (last 7 days, daily averages)
  const temperatureTrends = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayData = await Weather.find({
      timestamp: { $gte: dayStart, $lte: dayEnd }
    });

    if (dayData.length > 0) {
      const validRecords = dayData.filter(record => record.temperature != null);
      if (validRecords.length > 0) {
        const avgTemp = validRecords.reduce((sum, record) => sum + record.temperature!, 0) / validRecords.length;
        temperatureTrends.push({
          date: date.toISOString().split('T')[0],
          avgTemp: Math.round(avgTemp * 100) / 100
        });
      }
    }
  }

  // Hottest city today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayData = await Weather.find({
    timestamp: { $gte: today, $lt: tomorrow }
  });

  let hottestCity = null;
  if (todayData.length > 0) {
    const validTodayData = todayData.filter(record => record.temperature != null);
    if (validTodayData.length > 0) {
      const cityTemps = validTodayData.reduce((acc, record) => {
        if (!acc[record.city] || acc[record.city] < record.temperature!) {
          acc[record.city] = record.temperature!;
        }
        return acc;
      }, {} as Record<string, number>);

      const hottest = (Object.entries(cityTemps) as [string, number][]).reduce((max, [city, temp]) =>
        temp > max.temp ? { city, temp } : max,
        { city: '', temp: -Infinity }
      );

      hottestCity = {
        city: hottest.city,
        temperature: Math.round(hottest.temp * 100) / 100
      };
    }
  }

  // Average temperatures by city (last 7 days)
  const cityAverages = await Weather.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate },
        temperature: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: "$city",
        avgTemp: { $avg: "$temperature" },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        city: "$_id",
        avgTemp: { $round: ["$avgTemp", 2] },
        count: 1
      }
    },
    {
      $sort: { avgTemp: -1 }
    }
  ]);

  // Overall metrics (last 7 days)
  const overallMetrics = await Weather.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate },
        temperature: { $exists: true, $ne: null },
        humidity: { $exists: true, $ne: null },
        windSpeed: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: null,
        avgTemperature: { $avg: "$temperature" },
        avgHumidity: { $avg: "$humidity" },
        avgWindSpeed: { $avg: "$windSpeed" },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        avgTemperature: { $round: ["$avgTemperature", 2] },
        avgHumidity: { $round: ["$avgHumidity", 2] },
        avgWindSpeed: { $round: ["$avgWindSpeed", 2] },
        totalRecords: "$count"
      }
    }
  ]);

  const metrics = overallMetrics[0] || {
    avgTemperature: 0,
    avgHumidity: 0,
    avgWindSpeed: 0,
    totalRecords: 0
  };

  return NextResponse.json({
    temperatureTrends,
    hottestCity,
    cityAverages: cityAverages.map(item => ({
      city: item.city,
      avgTemp: item.avgTemp
    })),
    overallMetrics: {
      avgTemperature: metrics.avgTemperature,
      avgHumidity: metrics.avgHumidity,
      avgWindSpeed: metrics.avgWindSpeed,
      totalRecords: metrics.totalRecords
    }
  });
}