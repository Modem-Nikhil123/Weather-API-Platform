import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import TrackedCity from "@/models/TrackedCity";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active") === "true";

    const query = activeOnly ? { isActive: true } : {};

    const cities = await TrackedCity.find(query)
      .sort({ name: 1 })
      .select("-__v");

    return NextResponse.json({
      count: cities.length,
      cities,
    });
  } catch (error) {
    console.error("Error fetching tracked cities:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracked cities" },
      { status: 500 }
    );
  }
}
