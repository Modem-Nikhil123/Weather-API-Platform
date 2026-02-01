import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import TrackedCity from "@/models/TrackedCity";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const city = await TrackedCity.findById(id);

    if (!city) {
      return NextResponse.json(
        { error: "City not found" },
        { status: 404 }
      );
    }

    // Deactivate instead of deleting to preserve history
    await TrackedCity.findByIdAndUpdate(id, {
      isActive: false,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      message: `City "${city.name}" removed from tracking`,
      city,
      status: "tracking_stopped",
    });
  } catch (error) {
    console.error("Error removing city from tracking:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to remove city from tracking", details: errorMessage },
      { status: 500 }
    );
  }
}
