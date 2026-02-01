import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Usage from "@/models/Usage";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const apiKey = user.apiKey;

  let usage = { today: 0, monthly: 0, endpoints: {} };

  if (apiKey) {
    // Today's date
    const today = new Date().toISOString().split('T')[0];

    // Get today's usage
    const todayUsages = await Usage.find({ apiKey, date: today });
    usage.today = todayUsages.reduce((sum, u) => sum + u.count, 0);

    // Get monthly usage (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];

    const monthlyUsages = await Usage.find({
      apiKey,
      date: { $gte: startDate }
    });

    usage.monthly = monthlyUsages.reduce((sum, u) => sum + u.count, 0);

    // Get endpoint breakdown
    usage.endpoints = todayUsages.reduce((acc, usage) => {
      acc[usage.endpoint] = (acc[usage.endpoint] || 0) + usage.count;
      return acc;
    }, {} as Record<string, number>);
  }

  return NextResponse.json({
    name: user.name || session.user.name,
    email: user.email,
    plan: user.plan || "FREE",
    apiKey: user.apiKey,
    usage,
  });
}