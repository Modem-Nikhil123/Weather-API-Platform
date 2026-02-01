import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Usage from "@/models/Usage";
import User from "@/models/User";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email });
  if (!user?.apiKey) {
    return NextResponse.json({ daily: 0, monthly: 0 });
  }

  const apiKey = user.apiKey;

  // Today's date
  const today = new Date().toISOString().split('T')[0];

  // Get today's usage by endpoint
  const todayUsages = await Usage.find({ apiKey, date: today });
  const daily = todayUsages.reduce((sum, u) => sum + u.count, 0);

  // Get monthly usage (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const startDate = thirtyDaysAgo.toISOString().split('T')[0];

  const monthlyUsages = await Usage.find({
    apiKey,
    date: { $gte: startDate }
  });

  const monthly = monthlyUsages.reduce((sum, u) => sum + u.count, 0);

  // Get endpoint breakdown for today
  const endpointUsage = todayUsages.reduce((acc, usage) => {
    acc[usage.endpoint] = (acc[usage.endpoint] || 0) + usage.count;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({
    daily,
    monthly,
    endpoints: endpointUsage,
    limits: {
      daily: user.dailyQuota,
      monthly: user.monthlyQuota
    }
  });
}